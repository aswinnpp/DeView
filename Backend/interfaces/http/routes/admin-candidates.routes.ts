import type { FastifyInstance } from 'fastify';
import { requireAdminAuth } from '../middleware/adminAuthMiddleware.js';
import type { CandidateProfileController } from '../controllers/candidate-profile.controller.js';

export async function adminCandidatesRoutes(
  fastify: FastifyInstance,
  controller: CandidateProfileController,
): Promise<void> {
  fastify.addHook('preHandler', requireAdminAuth);

  fastify.get('/', {
    handler: controller.getAll,
  });
}
