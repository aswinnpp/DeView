import { FastifyInstance } from 'fastify';
import { getControllers } from './container.js';
import { authRoutes } from '../../interfaces/http/routes/authRoutes.js';
import { googleAuthRoutes } from '../../interfaces/http/routes/googleAuthRoutes.js';
import { companyApprovalRoutes } from '../../interfaces/http/routes/companyApprovalRoutes.js';
import { companyProfileRoutes } from '../../interfaces/http/routes/companyProfileRoutes.js';
import { adminCompanyApprovalRoutes } from '../../interfaces/http/routes/adminCompanyApprovalRoutes.js';
import { uploadRoutes } from '../../interfaces/http/routes/uploadRoutes.js';
import { companyTeamRoutes } from '../../interfaces/http/routes/companyTeamRoutes.js';
import { candidateProfileRoutes } from '../../interfaces/http/routes/candidateProfileRoutes.js';

export async function registerRoutes(fastify: FastifyInstance, controllers: ReturnType<typeof getControllers>): Promise<void> {
    await fastify.register(
        async (instance) => {
            await authRoutes(instance, controllers.authController);
            await googleAuthRoutes(instance, controllers.googleAuthController);
        },
        { prefix: '/auth' }
    );

    await fastify.register(
        async (instance) => {
            await companyApprovalRoutes(instance, controllers.companyApprovalController);
            await companyProfileRoutes(instance, controllers.companyProfileController);
            await companyTeamRoutes(instance, controllers.companyTeamController);
        },
        { prefix: '/company' }
    );

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

