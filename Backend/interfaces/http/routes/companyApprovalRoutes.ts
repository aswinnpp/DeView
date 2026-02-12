import { FastifyInstance } from 'fastify';
import { CompanyApprovalController } from '../controllers/CompanyApprovalController.js';
import { checkStatusSchema, submitCompanyApprovalSchema } from '../schemas/companyApprovalSchema.js';

export async function companyApprovalRoutes(
    fastify: FastifyInstance,
    controller: CompanyApprovalController
): Promise<void> {

    // Check approval status (called during login)
    fastify.post('/check-status', {
        schema: checkStatusSchema,
        handler: controller.checkStatus,
    });

    // Get current user's approval (requires auth)
    fastify.get('/my-approval', {
        preHandler: [fastify.authenticate],
        handler: controller.getMyApproval,
    });

    // Submit company approval request (requires auth)
    fastify.post('/submit', {
        schema: submitCompanyApprovalSchema,
        preHandler: [fastify.authenticate],
        handler: controller.submit,
    });

    console.log('✅ Company routes registered');
}
