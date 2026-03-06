import type { Server as HTTPServer } from 'http';
import type { FastifyInstance } from 'fastify';
import { Server as SocketIOServer } from 'socket.io';
import { signalingController } from '../../interfaces/controllers/signalingController.js';

export interface InterviewSocketContext {
  io: SocketIOServer;
}

export function createInterviewSocketServer(
  fastify: FastifyInstance,
  frontendUrl: string
): InterviewSocketContext {
  const httpServer = fastify.server as HTTPServer;

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        const allowed = ['http://localhost:5174', frontendUrl];

        if (!origin || allowed.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('CORS not allowed'));
        }
      },
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    fastify.log.info({ socketId: socket.id }, 'WebRTC socket connected');
    signalingController(io, socket);
  });

  return { io };
}

