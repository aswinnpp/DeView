import type { FastifyInstance } from 'fastify';
import { requireRoles } from '../middleware/authMiddleware.js';
import type { DashboardStatsController } from '../controllers/dashboard-stats.controller.js';

export async function companyDashboardRoutes(
  fastify: FastifyInstance,
  controller: DashboardStatsController,
): Promise<void> {
  fastify.addHook('preHandler', requireRoles('company', 'hr'));

  fastify.get('/dashboard/stats', {
    handler: controller.getCompanyDashboardStats,
  });
}
