import type { FastifyInstance } from 'fastify';
import { AdminSubscribtionController } from "../controllers/admin-subscribtion.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export async function companySubcribtionRoutes(
  fastify: FastifyInstance,
  controller: AdminSubscribtionController
): Promise<void> {
  fastify.addHook("preHandler", requireAuth);

  fastify.get("/subscribtion", {
    handler: controller.list,
  });
}

