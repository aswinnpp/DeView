import type { FastifyInstance } from 'fastify';
import { InterviewRoomController } from '../controllers/interview-room.controller.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export async function interviewRoomRoutes(
  fastify: FastifyInstance,
  controller: InterviewRoomController
): Promise<void> {
  fastify.addHook('preHandler', requireAuth);

  fastify.get<{
    Params: { interviewId: string };
  }>('/:interviewId/room', {
    handler: controller.getRoomDetails,
  });
}

