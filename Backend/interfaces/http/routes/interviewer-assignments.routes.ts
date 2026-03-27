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

  fastify.get('/assignments/:interviewId/resume-view-url', {
    preHandler: requireRoles('interviewer'),
    handler: controller.getResumeViewUrl,
  });

  fastify.get('/completed-interviews', {
    preHandler: requireRoles('interviewer'),
    handler: controller.listCompleted,
  });

  fastify.patch('/assignments/:interviewId/accept', {
    preHandler: requireRoles('interviewer'),
    handler: controller.accept,
  });

  fastify.patch('/assignments/:interviewId/reject', {
    preHandler: requireRoles('interviewer'),
    handler: controller.reject,
  });

  fastify.patch('/interviews/:interviewId/feedback', {
    preHandler: requireRoles('interviewer'),
    handler: controller.submitFeedback,
  });
}
