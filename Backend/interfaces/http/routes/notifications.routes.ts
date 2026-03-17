import type { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/authMiddleware.js";
import type { NotificationsController } from "../controllers/notifications.controller.js";

export async function notificationsRoutes(
  fastify: FastifyInstance,
  controller: NotificationsController,
) {
  fastify.addHook("preHandler", requireAuth);

  fastify.get("/", { handler: controller.list });
  fastify.patch("/:notificationId/read", { handler: controller.markRead });
  fastify.delete("/:notificationId", { handler: controller.remove });
}

