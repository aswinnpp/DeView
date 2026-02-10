import { FastifyInstance } from 'fastify';
import { Controllers } from './controllers.js';

import { authRoutes } from '../../interfaces/http/routes/authRoutes.js';
import { googleAuthRoutes } from '../../interfaces/http/routes/googleAuthRoutes.js';
import { companyApprovalRoutes } from '../../interfaces/http/routes/companyApprovalRoutes.js';

export async function registerRoutes(
    fastify: FastifyInstance,
    controllers: Controllers
): Promise<void> {
    // Auth routes
    await fastify.register(
        async (instance) => {
            await authRoutes(instance, controllers.authController);
            await googleAuthRoutes(instance, controllers.googleAuthController);
        },
        { prefix: '/auth' }
    );

    // Company approval routes
    await fastify.register(
        async (instance) => {
            await companyApprovalRoutes(instance, controllers.companyApprovalController);
        },
        { prefix: '/company' }
    );
}

