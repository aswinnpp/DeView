import { FastifyInstance } from 'fastify';
import { CompanyApprovalController } from '../controllers/company-approval.controller.js';
import { submitCompanyApprovalSchema } from '../schemas/company-approval.schema.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export async function companyApprovalRoutes(
    fastify: FastifyInstance,
    controller: CompanyApprovalController
): Promise<void> {

    fastify.addHook("preHandler", requireAuth);

    fastify.get('/check-status', {
        handler: controller.checkStatus,
    });

    fastify.get('/my-approval', {
        handler: controller.getMyApproval,
    });

    fastify.patch('/submit', {
        schema: submitCompanyApprovalSchema,
        handler: controller.submit,
    });

    fastify.log.info('Company routes registered');
}
