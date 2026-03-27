import { FastifyInstance } from 'fastify';
import { ApplicationsController } from '../controllers/applications.controller.js';
import { requireRoles } from '../middleware/authMiddleware.js';

export async function applicationsRoutes(
  fastify: FastifyInstance,
  controller: ApplicationsController
) {
  fastify.addHook('preHandler', requireRoles('company', 'hr' ));

  fastify.get('/offer-mails', {
    handler: controller.listOfferMails,
  });

  fastify.get('/offer-mails/:offerMailId/signed-pdf', {
    handler: controller.downloadOfferSignedPdf,
  });

  fastify.patch('/offer-mails/:offerMailId/counter/respond', {
    handler: controller.respondToCounterLetter,
  });

  fastify.get('/jobs', {
    handler: controller.listJobs,
  });

  fastify.get('/jobs/:jobId/applications', {
    handler: controller.listPendingApplications,
  });

  fastify.get('/jobs/:jobId/applications/:applicationId/resume-view-url', {
    handler: controller.getResumeViewUrl,
  });

  fastify.get('/jobs/:jobId/applications/:applicationId/interview/precheck', {
    handler: controller.precheckScheduleInterview,
  });

  fastify.patch('/jobs/:jobId/score-candidates', {
    handler: controller.scoreCandidates,
  });

  fastify.put('/jobs/:jobId/applications/:applicationId/status', {
    handler: controller.updateStatus,
  });

  fastify.patch('/jobs/:jobId/applications/:applicationId/interview', {
    handler: controller.scheduleInterview,
  });

  fastify.patch('/jobs/:jobId/applications/:applicationId/reschedule/decline', {
    handler: controller.declineRescheduleRequest,
  });

  fastify.get('/jobs/:jobId/applications/:applicationId/interviewer-feedback', {
    handler: controller.getLatestInterviewerFeedback,
  });
}
