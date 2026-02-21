import { FastifyInstance } from 'fastify';
import { CompanyApprovalController } from '../controllers/CompanyApprovalController.js';
import {
    checkStatusSchema,
    submitCompanyApprovalSchema,
    checkStatusBodyParser,
    submitCompanyApprovalBodyParser,
} from '../schemas/companyApprovalSchema.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export async function companyApprovalRoutes(
    fastify: FastifyInstance,
    controller: CompanyApprovalController
): Promise<void> {

    fastify.addHook("preHandler", requireAuth);

    fastify.post('/check-status', {
        schema: checkStatusSchema,
        preHandler: [checkStatusBodyParser],
        handler: controller.checkStatus,
    });

    // Get current user's approval (requires auth)
    fastify.get('/my-approval', {
        preHandler: [requireAuth],
        handler: controller.getMyApproval,
    });

    // Submit company approval request (requires auth)
    fastify.post('/submit', {
        schema: submitCompanyApprovalSchema,
        preHandler: [submitCompanyApprovalBodyParser],
        handler: controller.submit,
    });

    console.log(' Company routes registered');
}
