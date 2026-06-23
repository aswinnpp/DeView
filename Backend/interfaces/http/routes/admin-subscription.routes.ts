import { FastifyInstance } from 'fastify';
import { AdminSubscriptionController } from "../controllers/admin-subscription.controller.js";
import { requireAdminAuth } from '../middleware/adminAuthMiddleware.js';

export async function subscriptionRoutes(
  fastify: FastifyInstance,
  controller: AdminSubscriptionController
): Promise<void> {
  fastify.addHook("preHandler", requireAdminAuth);

  fastify.get("/subscription", {
    handler: controller.list,
  });

  fastify.post("/subscription", {
    handler: controller.create,
  });

  fastify.put("/subscription/:id", {
    handler: controller.update,
  });

  fastify.patch("/subscription/:id/toggle-active", {
    handler: controller.toggle,
  });

  fastify.get("/subscription-history", {
    handler: controller.listHistory,
  });
}

