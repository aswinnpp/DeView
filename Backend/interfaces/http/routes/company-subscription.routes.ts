import type { FastifyInstance } from 'fastify';
import { AdminSubscriptionController } from "../controllers/admin-subscription.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export async function companySubscriptionRoutes(
  fastify: FastifyInstance,
  controller: AdminSubscriptionController
): Promise<void> {
  fastify.addHook("preHandler", requireAuth);

  fastify.get("/subscription", {
    handler: controller.list,
  });
}
