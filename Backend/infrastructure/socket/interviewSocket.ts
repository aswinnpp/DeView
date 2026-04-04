import type { Server as HTTPServer } from 'http';
import type { FastifyInstance } from 'fastify';
import { Server as SocketIOServer } from 'socket.io';
import { signalingController } from '../../interfaces/http/controllers/signaling-Controller.js';
import { setSocketServer } from './socketContext.js';
import { getHttpsCorsOriginSet, isAllowedBrowserOrigin } from '../config/corsOrigins.js';

export interface InterviewSocketContext {
  io: SocketIOServer;
}

export function createInterviewSocketServer(fastify: FastifyInstance): InterviewSocketContext {
  const httpServer = fastify.server as HTTPServer;

  const socketCorsOrigins = getHttpsCorsOriginSet(fastify.log);

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isAllowedBrowserOrigin(origin, socketCorsOrigins)) {
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

