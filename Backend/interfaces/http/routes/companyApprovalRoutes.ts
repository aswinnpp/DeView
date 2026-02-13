import { FastifyInstance } from 'fastify';
import { CompanyApprovalController } from '../controllers/CompanyApprovalController.js';
import { checkStatusSchema, submitCompanyApprovalSchema } from '../schemas/companyApprovalSchema.js';
import { requireAuth } from '../middleware/authMiddleware.js';

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
        preHandler: [requireAuth],
        handler: controller.getMyApproval,
    });

    // Submit company approval request (requires auth)
    fastify.post('/submit', {
        schema: submitCompanyApprovalSchema,
        preHandler: [requireAuth],
        handler: controller.submit,
    });

    console.log('✅ Company routes registered');
}
