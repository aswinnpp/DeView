import type { FastifyInstance } from 'fastify';
import type { LandingStatsController } from '../controllers/landing-stats.controller.js';

export async function landingStatsRoutes(
  fastify: FastifyInstance,
  controller: LandingStatsController,
) {
  fastify.get('/stats', {
    handler: controller.getLandingStats,
  });
}

