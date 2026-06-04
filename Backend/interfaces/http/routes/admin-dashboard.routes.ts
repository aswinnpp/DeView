import type { FastifyInstance } from 'fastify';
import { requireRoles } from '../middleware/authMiddleware.js';
import type { DashboardStatsController } from '../controllers/dashboard-stats.controller.js';

export async function adminDashboardRoutes(
  fastify: FastifyInstance,
  controller: DashboardStatsController,
): Promise<void> {
  fastify.addHook('preHandler', requireRoles('admin'));

  fastify.get('/dashboard/stats', {
    handler: controller.getAdminDashboardStats,
  });
}
