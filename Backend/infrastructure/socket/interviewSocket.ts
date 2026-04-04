import type { Server as HTTPServer } from 'http';
import type { FastifyInstance } from 'fastify';
import { Server as SocketIOServer } from 'socket.io';
import { signalingController } from '../../interfaces/http/controllers/signaling-Controller.js';
import { setSocketServer } from './socketContext.js';

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
        const normalized = (u: string) => u.replace(/\/$/, '');
        const allowed = new Set(
          [
            normalized(frontendUrl),
            'https://deview.serveftp.com',
            'https://deview.ddns.net',
            'http://localhost:5174',
            'http://127.0.0.1:5174',
          ].filter(Boolean),
        );

        if (!origin || allowed.has(origin)) {
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

  setSocketServer(io);
  return { io };
}

