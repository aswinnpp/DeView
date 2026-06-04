import type { FastifyInstance } from 'fastify';
import { InterviewRoomController } from '../controllers/interview-room.controller.js';
import { requireAuth, requireRoles } from '../middleware/authMiddleware.js';

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

  fastify.patch<{
    Params: { interviewId: string };
    Body: { status: 'COMPLETED' | 'CANCELLED' };
  }>('/:interviewId/status', {
    preHandler: requireRoles('interviewer'),
    handler: controller.updateStatus,
  });
}

