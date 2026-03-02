import { FastifyInstance } from 'fastify';
import { ApplicationsController } from '../controllers/applications.controller.js';
import { requireRoles } from '../middleware/authMiddleware.js';

export async function applicationsRoutes(
  fastify: FastifyInstance,
  controller: ApplicationsController
) {
  // Only company and HR users can access applications
  fastify.addHook('preHandler', requireRoles('company', 'hr'));

  /** List company jobs */
  fastify.get('/jobs', {
    handler: controller.listJobs,
  });

  /** List pending applications for a job */
  fastify.get('/jobs/:jobId/applications', {
    handler: controller.listPendingApplications,
  });

  /** Get fresh pre-signed URL to view an application resume (avoids expired S3 link) */
  fastify.get('/jobs/:jobId/applications/:applicationId/resume-view-url', {
    handler: controller.getResumeViewUrl,
  });

  /** Score candidates against job using AI */
  fastify.post('/jobs/:jobId/score-candidates', {
    handler: controller.scoreCandidates,
  });
}
