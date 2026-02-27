import { FastifyInstance } from 'fastify';
import { CompanyApprovalController } from '../controllers/company-approval.controller.js';
import { checkStatusSchema, submitCompanyApprovalSchema } from '../schemas/company-approval.schema.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export async function companyApprovalRoutes(
    fastify: FastifyInstance,
    controller: CompanyApprovalController
): Promise<void> {

    fastify.addHook("preHandler", requireAuth);

    fastify.post('/check-status', {
        schema: checkStatusSchema,
        handler: controller.checkStatus,
    });

    fastify.get('/my-approval', {
        handler: controller.getMyApproval,
    });

    // Submit company approval request (requires auth)
    fastify.post('/submit', {
        schema: submitCompanyApprovalSchema,
        handler: controller.submit,
    });

    console.log(' Company routes registered');
}
