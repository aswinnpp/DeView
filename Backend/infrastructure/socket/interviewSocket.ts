import type { Server as HTTPServer } from 'http';
import type { FastifyInstance } from 'fastify';
import { Server as SocketIOServer, type Socket } from 'socket.io';
import type { IInterviewRepository } from '../../application/interview/ports/repository/IInterviewRepository.js';
import type { Interview } from '../../domain/interview/entities/Interview.js';

export interface InterviewSocketContext {
  io: SocketIOServer;
}

export function createInterviewSocketServer(
  fastify: FastifyInstance,
  interviewRepository: IInterviewRepository,
  corsOrigin: boolean | string
): InterviewSocketContext {
  const httpServer = fastify.server as HTTPServer;

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: corsOrigin === true ? '*' : corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  const namespace = io.of('/interview');

  namespace.on('connection', (socket: Socket) => {
    socket.on(
      'join-room',
      async (payload: { interviewId: string; roomName: string; displayName?: string }) => {
        try {
          const { interviewId, roomName, displayName } = payload;

          const interview = await interviewRepository.findById(interviewId);
          if (!interview || !matchesRoom(interview, roomName)) {
            socket.emit('error', 'Not allowed to join this interview');
            socket.disconnect();
            return;
          }

          const roomKey = getRoomKey(roomName);
          await socket.join(roomKey);

          namespace.to(roomKey).emit('user-joined', {
            displayName: displayName ?? 'Guest',
            at: new Date().toISOString(),
            socketId: socket.id,
          });
        } catch {
          socket.emit('error', 'Failed to join room');
        }
      }
    );

    socket.on(
      'chat-message',
      async (payload: { interviewId: string; roomName: string; message: string; displayName: string }) => {
        try {
          const { interviewId, roomName, message, displayName } = payload;

          const interview = await interviewRepository.findById(interviewId);
          if (!interview || !matchesRoom(interview, roomName)) {
            return;
          }

          const roomKey = getRoomKey(roomName);
          const timestamp = new Date().toISOString();

          namespace.to(roomKey).emit('chat-message', {
            displayName,
            message,
            timestamp,
          });
        } catch {
          // swallow to avoid crashing socket
        }
      }
    );

    socket.on(
      'webrtc-offer',
      async (payload: {
        interviewId: string;
        roomName: string;
        sdp: unknown;
        to: string;
      }) => {
        try {
          const { interviewId, roomName, sdp, to } = payload;

          const interview = await interviewRepository.findById(interviewId);
          if (!interview || !matchesRoom(interview, roomName)) {
            return;
          }

          namespace.to(to).emit('webrtc-offer', {
            interviewId,
            roomName,
            sdp,
            from: socket.id,
          });
        } catch {
          // ignore signaling errors
        }
      }
    );

    socket.on(
      'webrtc-answer',
      async (payload: {
        interviewId: string;
        roomName: string;
        sdp: unknown;
        to: string;
      }) => {
        try {
          const { interviewId, roomName, sdp, to } = payload;

          const interview = await interviewRepository.findById(interviewId);
          if (!interview || !matchesRoom(interview, roomName)) {
            return;
          }

          namespace.to(to).emit('webrtc-answer', {
            interviewId,
            roomName,
            sdp,
          });
        } catch {
          // ignore signaling errors
        }
      }
    );

    socket.on(
      'webrtc-ice-candidate',
      async (payload: {
        interviewId: string;
        roomName: string;
        candidate: unknown;
        to: string;
      }) => {
        try {
          const { interviewId, roomName, candidate, to } = payload;

          const interview = await interviewRepository.findById(interviewId);
          if (!interview || !matchesRoom(interview, roomName)) {
            return;
          }

          namespace.to(to).emit('webrtc-ice-candidate', {
            interviewId,
            roomName,
            candidate,
          });
        } catch {
          // ignore signaling errors
        }
      }
    );

    socket.on('disconnect', () => {
      // No-op for now; client can handle presence if needed
    });
  });

  return { io };
}

function getRoomKey(roomName: string): string {
  return `room-${roomName}`;
}

function matchesRoom(interview: Interview, roomName: string): boolean {
  return Boolean(interview.roomName && interview.roomName === roomName);
}

