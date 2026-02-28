import { FastifyInstance } from 'fastify';
import { getControllers } from './container.js';
import { authRoutes } from '../../interfaces/http/routes/auth.routes.js';
import { googleAuthRoutes } from '../../interfaces/http/routes/google-auth.routes.js';
import { companyApprovalRoutes } from '../../interfaces/http/routes/company-approval.routes.js';
import { companyProfileRoutes } from '../../interfaces/http/routes/company-profile.routes.js';
import { adminCompanyApprovalRoutes } from '../../interfaces/http/routes/admin-company-approval.routes.js';
import { uploadRoutes } from '../../interfaces/http/routes/upload.routes.js';
import { companyTeamRoutes } from '../../interfaces/http/routes/company-team.routes.js';
import { candidateProfileRoutes } from '../../interfaces/http/routes/candidate-profile.routes.js';
import { subcribtionRoutes } from '../../interfaces/http/routes/admin-subscribtion.routes.js';
import { companySubcribtionRoutes } from '../../interfaces/http/routes/company-subscribtion.routes.js';
import { companyPaymentRoutes } from '../../interfaces/http/routes/company-payment.routes.js';
import { stripeWebhookRoutes } from '../../interfaces/http/routes/stripe-webhook.routes.js';
import { jobRoutes } from '../../interfaces/http/routes/jobs.routes.js';

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
            await companySubcribtionRoutes(instance, controllers.adminsubscribtioncontroller);
            await companyPaymentRoutes(instance, controllers.companyPaymentController);
        },
        { prefix: '/company' }
    );

    // Stripe webhooks must be public and outside /company auth hooks
    await fastify.register(
        async (instance) => {
            await stripeWebhookRoutes(instance, controllers.companyPaymentController);
        },
        { prefix: '/webhooks' }
    );

    await fastify.register(
        async (instance) => {
            await adminCompanyApprovalRoutes(instance, controllers.adminCompanyApprovalController);
            await subcribtionRoutes(instance, controllers.adminsubscribtioncontroller);
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


    await fastify.register(
        async (instance) => {
            await jobRoutes(instance, controllers.jobsControllers);
        },
        { prefix: '/jobs' }
    );
}

