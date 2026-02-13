import { FastifyInstance } from 'fastify';
import { AdminCompanyApprovalController } from '../controllers/AdminCompanyApprovalController.js';
import { requireRoles } from '../middleware/authMiddleware.js';
import { approveCompanySchema, rejectCompanySchema } from '../schemas/adminCompanyApprovalSchema.js';

export async function adminCompanyApprovalRoutes(
    fastify: FastifyInstance,
    controller: AdminCompanyApprovalController
): Promise<void> {
    const adminOnly = [requireRoles('admin')];


    fastify.get('/pending', {
        preHandler: adminOnly,
        handler: controller.getPending,
    });

    fastify.post('/:id/approve', {
        schema: approveCompanySchema,
        preHandler: adminOnly,
        handler: controller.approve,
    });

    fastify.post('/:id/reject', {
        schema: rejectCompanySchema,
        preHandler: adminOnly,
        handler: controller.reject,
    });

    fastify.patch('/:id/documents/:key/mark', {
        preHandler: adminOnly,
        handler: controller.markDocument,
    });

    console.log('✅ Admin company approval routes registered');
}
