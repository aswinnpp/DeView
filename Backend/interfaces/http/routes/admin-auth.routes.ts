import { FastifyInstance } from 'fastify';
import { AdminAuthController } from '../controllers/admin-auth.controller.js';
import { loginSchema } from '../schemas/login.schema.js';

export async function adminAuthRoutes(
    fastify: FastifyInstance,
    controller: AdminAuthController
): Promise<void> {
    fastify.post('/login', {
        schema: loginSchema,
        handler: controller.login,
    });

    fastify.post('/refresh', {
        handler: controller.refresh,
    });

    fastify.post('/logout', {
        handler: controller.logout,
    });

    fastify.log.info('Admin auth routes registered');
}
