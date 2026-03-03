import { FastifyInstance } from 'fastify';
import { CandidateJobsController } from '../controllers/candidate-jobs.controller.js';
import { requireAuth, requireRoles } from '../middleware/authMiddleware.js';
import { applyForJobSchema } from '../schemas/apply-for-job.schema.js';

export async function candidateJobsRoutes(
  fastify: FastifyInstance,
  controller: CandidateJobsController
): Promise<void> {
  fastify.addHook('preHandler', requireAuth);
  fastify.addHook('preHandler', requireRoles('candidate'));

  fastify.get('/jobs', {
    handler: controller.getAllJobs,
  });

  fastify.post('/jobs/:jobId/apply', {
    schema: applyForJobSchema,
    handler: controller.applyForJob,
  });

  fastify.get('/applications/my', {
    handler: controller.listMyApplications,
  });

}
