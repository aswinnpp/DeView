import { FastifyInstance } from 'fastify';
import { CandidateJobsController } from '../controllers/candidate-jobs.controller.js';
import { requireAuth, requireRoles } from '../middleware/authMiddleware.js';
import { applyForJobSchema } from '../schemas/apply-for-job.schema.js';

export async function candidateJobsRoutes(
  fastify: FastifyInstance,
  controller: CandidateJobsController
): Promise<void> {
  fastify.addHook('preHandler', requireAuth);

  
  
  fastify.get('/jobs', {
    preHandler: requireRoles('candidate'),
    handler: controller.getAllJobs,
  });
  
  fastify.post('/jobs/:jobId/apply', {
    preHandler: requireRoles('candidate'),
    schema: applyForJobSchema,
    handler: controller.applyForJob,
  });
  
  fastify.get('/applications/my', {
    preHandler: requireRoles('candidate'),
    handler: controller.listMyApplications,
  });

  fastify.get('/mailbox', {
    preHandler: requireRoles('candidate'),
    handler: controller.listMailbox,
  });

  fastify.post('/mailbox/offers/:offerMailId/counter', {
    preHandler: requireRoles('candidate'),
    handler: controller.submitOfferCounter,
  });
}
