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

  fastify.post('/mailbox/offers/:offerMailId/respond', {
    preHandler: requireRoles('candidate'),
    handler: controller.respondToOffer,
  });

  fastify.post('/mailbox/offers/:offerMailId/signing/begin', {
    preHandler: requireRoles('candidate'),
    handler: controller.beginOfferSigning,
  });

  fastify.post('/mailbox/offers/:offerMailId/signing/confirm', {
    preHandler: requireRoles('candidate'),
    handler: controller.confirmOfferSigning,
  });

  fastify.get('/mailbox/offers/:offerMailId/signed-pdf', {
    preHandler: requireRoles('candidate'),
    handler: controller.downloadSignedOfferPdf,
  });
}
