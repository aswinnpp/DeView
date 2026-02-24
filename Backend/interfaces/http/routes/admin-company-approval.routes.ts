import { FastifyInstance } from 'fastify';
import { AdminCompanyApprovalController } from '../controllers/admin-company-approval.controller.js';
import { requireRoles } from '../middleware/authMiddleware.js';
import { approveCompanySchema, rejectCompanySchema } from '../schemas/admin-company-approval.schema.js';

export async function adminCompanyApprovalRoutes(
    fastify: FastifyInstance,
    controller: AdminCompanyApprovalController
): Promise<void> {

    fastify.addHook("preHandler", requireRoles('admin'));

    fastify.get('/pending', {
        handler: controller.getPending,
    });

    fastify.get('/approved', {
        handler: controller.getApproved,
    });

    fastify.post('/:id/approve', {
        schema: approveCompanySchema,
        handler: controller.approve,
    });

    fastify.post('/:id/reject', {
        schema: rejectCompanySchema,
        handler: controller.reject,
    });

    fastify.post('/:id/toggle-active', {
        handler: controller.toggleActive,
    });

    fastify.patch('/:id/documents/:key/mark', {
        handler: controller.markDocument,
    });

    console.log('Admin company approval routes registered');
}
