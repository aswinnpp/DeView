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
import { candidateJobsRoutes } from '../../interfaces/http/routes/candidate-jobs.routes.js';
import { candidateInterviewsRoutes } from '../../interfaces/http/routes/candidate-interviews.routes.js';
import { subscriptionRoutes } from '../../interfaces/http/routes/admin-subscription.routes.js';
import { companySubscriptionRoutes } from '../../interfaces/http/routes/company-subscription.routes.js';
import { companyPaymentRoutes } from '../../interfaces/http/routes/company-payment.routes.js';
import { stripeWebhookRoutes } from '../../interfaces/http/routes/stripe-webhook.routes.js';
import { jobRoutes } from '../../interfaces/http/routes/jobs.routes.js';
import { applicationsRoutes } from '../../interfaces/http/routes/applications.routes.js';
import { interviewRoomRoutes } from '../../interfaces/http/routes/interview-room.routes.js';
import { interviewerAssignmentsRoutes } from '../../interfaces/http/routes/interviewer-assignments.routes.js';
import { interviewerProfileRoutes } from '../../interfaces/http/routes/interviewer-profile.routes.js';
import { interviewerSlotsRoutes } from "../../interfaces/http/routes/interviewer-slots.routes.js";

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
            await companySubscriptionRoutes(instance, controllers.adminSubscriptionController);
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
            await subscriptionRoutes(instance, controllers.adminSubscriptionController);
        },
        { prefix: '/admin/company-requests' }
    );

    // Upload routes
    await fastify.register(
        async (instance) => {
            await uploadRoutes(instance, controllers.uploadController);
        },
    );

    // Candidate routes (profile + jobs)
    await fastify.register(
        async (instance) => {
            await candidateProfileRoutes(instance, controllers.candidateProfileController);
            await candidateJobsRoutes(instance, controllers.candidateJobsController);
            await candidateInterviewsRoutes(instance, controllers.candidateInterviewsController);
        },
        { prefix: '/candidate' }
    );

    // Interviewer routes (assignments + profile)
    await fastify.register(
        async (instance) => {
            await interviewerAssignmentsRoutes(instance, controllers.interviewerAssignmentsController);
            await interviewerProfileRoutes(instance, controllers.interviewerProfileController);
            await interviewerSlotsRoutes(instance, controllers.interviewerSlotsController);
        },
        { prefix: '/interviewer' }
    );


    await fastify.register(
        async (instance) => {
            await jobRoutes(instance, controllers.jobsControllers);
        },
        { prefix: '/jobs' }
    );

    // Applications - company/HR only, independent prefix like jobs
    await fastify.register(
        async (instance) => {
            await applicationsRoutes(instance, controllers.applicationsController);
        },
        { prefix: '/applications' }
    );

    await fastify.register(
        async (instance) => {
            await interviewRoomRoutes(instance, controllers.interviewRoomController);
        },
        { prefix: '/interviews' }
    );
}

