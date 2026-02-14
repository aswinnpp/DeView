import { FastifyInstance } from 'fastify';
import { Controllers } from './controllers.js';

import { authRoutes } from '../../interfaces/http/routes/authRoutes.js';
import { googleAuthRoutes } from '../../interfaces/http/routes/googleAuthRoutes.js';
import { companyApprovalRoutes } from '../../interfaces/http/routes/companyApprovalRoutes.js';
import { adminCompanyApprovalRoutes } from '../../interfaces/http/routes/adminCompanyApprovalRoutes.js';
import { uploadRoutes } from '../../interfaces/http/routes/uploadRoutes.js';
import { companyTeamRoutes } from '../../interfaces/http/routes/companyTeamRoutes.js';
import { candidateProfileRoutes } from '../../interfaces/http/routes/candidateProfileRoutes.js';

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

    // Company routes (approval + team management)
    await fastify.register(
        async (instance) => {
            await companyApprovalRoutes(instance, controllers.companyApprovalController);
            await companyTeamRoutes(instance, controllers.companyTeamController);
        },
        { prefix: '/company' }
    );

    // Admin company approval routes
    await fastify.register(
        async (instance) => {
            await adminCompanyApprovalRoutes(instance, controllers.adminCompanyApprovalController);
        },
        { prefix: '/admin/company-requests' }
    );

    // Upload routes
    await fastify.register(
        async (instance) => {
            await uploadRoutes(instance, controllers.uploadController);
        },
    );

    // Candidate profile routes
    await fastify.register(
        async (instance) => {
            await candidateProfileRoutes(instance, controllers.candidateProfileController);
        },
        { prefix: '/candidate' }
    );
}

