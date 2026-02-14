import { FastifyInstance } from 'fastify';
import { CompanyTeamController } from '../controllers/CompanyTeamController.js';
import { requireRoles } from '../middleware/authMiddleware.js';

export async function companyTeamRoutes(
    fastify: FastifyInstance,
    controller: CompanyTeamController
): Promise<void> {

    // ── HR routes ───────────────────────────────────────────────

    fastify.get('/hr/list', {
        preHandler: [requireRoles('company')],
        handler: controller.listHRs,
    });

    fastify.post('/hr/create', {
        preHandler: [requireRoles('company')],
        handler: controller.createHR,
    });

    fastify.patch('/hr/:id/toggle-status', {
        preHandler: [requireRoles('company')],
        handler: controller.toggleHRStatus,
    });

    // ── Interviewer routes ──────────────────────────────────────

    fastify.get('/interviewer/list', {
        preHandler: [requireRoles('company')],
        handler: controller.listInterviewers,
    });

    fastify.post('/interviewer/create', {
        preHandler: [requireRoles('company')],
        handler: controller.createInterviewer,
    });

    fastify.patch('/interviewer/:id/toggle-status', {
        preHandler: [requireRoles('company')],
        handler: controller.toggleInterviewerStatus,
    });

    console.log(' Company team routes registered');
}
