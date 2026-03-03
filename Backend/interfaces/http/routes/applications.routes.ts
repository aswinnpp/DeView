import { FastifyInstance } from 'fastify';
import { ApplicationsController } from '../controllers/applications.controller.js';
import { requireRoles } from '../middleware/authMiddleware.js';

export async function applicationsRoutes(
  fastify: FastifyInstance,
  controller: ApplicationsController
) {
  fastify.addHook('preHandler', requireRoles('company', 'hr'));

  fastify.get('/jobs', {
    handler: controller.listJobs,
  });

  fastify.get('/jobs/:jobId/applications', {
    handler: controller.listPendingApplications,
  });

  fastify.get('/jobs/:jobId/applications/:applicationId/resume-view-url', {
    handler: controller.getResumeViewUrl,
  });

  fastify.post('/jobs/:jobId/score-candidates', {
    handler: controller.scoreCandidates,
  });

  fastify.put('/jobs/:jobId/applications/:applicationId/status', {
    handler: controller.updateStatus,
  });
}
