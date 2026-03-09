import { FastifyInstance } from 'fastify';
import { CandidateInterviewsController } from '../controllers/candidate-interviews.controller.js';
import { requireAuth, requireRoles } from '../middleware/authMiddleware.js';

export async function candidateInterviewsRoutes(
  fastify: FastifyInstance,
  controller: CandidateInterviewsController
): Promise<void> {
  fastify.addHook('preHandler', requireAuth);

  fastify.get('/interviews/my', {
    preHandler: requireRoles('candidate'),
    handler: controller.listMy,
  });

  fastify.patch<{
    Params: { interviewId: string };
    Body: { requestedDate: string; reason: string };
  }>('/interviews/:interviewId/reschedule', {
    preHandler: requireRoles('candidate'),
    handler: controller.requestReschedule,
  });
}

