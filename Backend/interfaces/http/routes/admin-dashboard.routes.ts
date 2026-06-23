import type { FastifyInstance } from 'fastify';
import { requireAdminAuth } from '../middleware/adminAuthMiddleware.js';
import type { DashboardStatsController } from '../controllers/dashboard-stats.controller.js';

export async function adminDashboardRoutes(
  fastify: FastifyInstance,
  controller: DashboardStatsController,
): Promise<void> {
  fastify.addHook('preHandler', requireAdminAuth);

  fastify.get('/dashboard/stats', {
    handler: controller.getAdminDashboardStats,
  });
}
