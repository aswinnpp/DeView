import { FastifyInstance } from 'fastify';
import { CompanyProfileController } from '../controllers/company-profile.controller';
import { updateCompanyProfileSchema, updateCompanyProfileBodyParser } from '../schemas/company-profile.schema';
import { requireAuth } from '../middleware/authMiddleware.js';

export async function companyProfileRoutes(
    fastify: FastifyInstance,
    controller: CompanyProfileController
): Promise<void> {

    fastify.addHook("preHandler", requireAuth);

    fastify.get('/profile', {
        handler: controller.getProfile,
    });

    fastify.put('/profile', {
        schema: updateCompanyProfileSchema,
        preHandler: [updateCompanyProfileBodyParser],
        handler: controller.updateProfile,
    });

    console.log('Company profile routes registered');
}
