import { FastifyInstance } from 'fastify';
import { CompanyProfileController } from '../controllers/CompanyProfileController.js';
import { updateCompanyProfileSchema, updateCompanyProfileBodyParser } from '../schemas/companyProfileSchema.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export async function companyProfileRoutes(
    fastify: FastifyInstance,
    controller: CompanyProfileController
): Promise<void> {

    fastify.addHook("preHandler", requireAuth);

    // Get company profile (requires auth)
    fastify.get('/profile', {
        handler: controller.getProfile,
    });

    // Update company profile (requires auth)
    fastify.put('/profile', {
        schema: updateCompanyProfileSchema,
        preHandler: [updateCompanyProfileBodyParser],
        handler: controller.updateProfile,
    });

    console.log('Company profile routes registered');
}
