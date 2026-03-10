import { FastifyInstance } from 'fastify';
import { CompanyTeamController } from '../controllers/company-team.controller.js';
import { requireRoles } from '../middleware/authMiddleware.js';

export async function companyTeamRoutes(
    fastify: FastifyInstance,
    controller: CompanyTeamController
): Promise<void> {
    fastify.addHook("preHandler", requireRoles('company', 'hr'));

    // ── HR routes ───────────────────────────────────────────────

    fastify.get('/hr/list', {
        handler: controller.listHRs,
    });

    fastify.post('/hr/create', {
        handler: controller.createHR,
    });

    fastify.patch('/hr/:id/toggle-status', {
        handler: controller.toggleHRStatus,
    });

    // ── Interviewer routes ──────────────────────────────────────

    fastify.get('/interviewer/list', {
        handler: controller.listInterviewers,
    });

    fastify.post('/interviewer/create', {
        handler: controller.createInterviewer,
    });

    fastify.patch('/interviewer/:id/toggle-status', {
        handler: controller.toggleInterviewerStatus,
    });

    fastify.get('/interviewer/:id/slots', {
        handler: controller.getInterviewerSlots,
    });

}
