import { FastifyInstance } from 'fastify';
import { CompanyApprovalController } from '../controllers/CompanyApprovalController.js';

export async function companyApprovalRoutes(
    fastify: FastifyInstance,
    controller: CompanyApprovalController
): Promise<void> {

    // Check approval status (called during login)
    fastify.post('/check-status', {
        handler: controller.checkStatus,
    });

    // Submit company approval request (requires auth)
    fastify.post('/submit', {
        handler: controller.submit,
    });

    console.log('✅ Company routes registered');
}
