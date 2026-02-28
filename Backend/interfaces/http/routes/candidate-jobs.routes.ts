import { FastifyInstance } from 'fastify';
import { CandidateJobsController } from '../controllers/candidate-jobs.controller.js';
import { requireAuth, requireRoles } from '../middleware/authMiddleware.js';

export async function candidateJobsRoutes(
  fastify: FastifyInstance,
  controller: CandidateJobsController
): Promise<void> {
  fastify.addHook('preHandler', requireAuth);
  fastify.addHook('preHandler', requireRoles('candidate'));

  fastify.get('/jobs', {
    handler: controller.getAllJobs,
  });

  console.log('Candidate jobs routes registered');
}
