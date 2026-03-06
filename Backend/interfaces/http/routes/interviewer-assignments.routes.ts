import { FastifyInstance } from 'fastify';
import { InterviewerAssignmentsController } from '../controllers/interviewer-assignments.controller.js';
import { requireAuth, requireRoles } from '../middleware/authMiddleware.js';

export async function interviewerAssignmentsRoutes(
  fastify: FastifyInstance,
  controller: InterviewerAssignmentsController
): Promise<void> {
  fastify.addHook('preHandler', requireAuth);

  fastify.get('/assignments', {
    preHandler: requireRoles('interviewer'),
    handler: controller.list,
  });

  fastify.post('/assignments/:interviewId/accept', {
    preHandler: requireRoles('interviewer'),
    handler: controller.accept,
  });

  fastify.post('/assignments/:interviewId/reject', {
    preHandler: requireRoles('interviewer'),
    handler: controller.reject,
  });
}
