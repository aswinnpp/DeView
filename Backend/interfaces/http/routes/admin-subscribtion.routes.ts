import { FastifyInstance } from 'fastify';
import { AdminSubscribtionController } from "../controllers/admin-subscribtion.controller.js";
import { requireRoles } from "../middleware/authMiddleware.js";

export async function subcribtionRoutes(
  fastify: FastifyInstance,
  controller: AdminSubscribtionController
): Promise<void> {
  fastify.addHook("preHandler", requireRoles('admin'));

  fastify.get("/subscribtion", {
    handler: controller.list,
  });

  fastify.post("/subscribtion", {
    handler: controller.subcribtion,
  });

  fastify.put("/subscribtion/:id", {
    handler: controller.update,
  });

  fastify.post("/subscribtion/:id/toggle-active", {
    handler: controller.toggle,
  });
}
