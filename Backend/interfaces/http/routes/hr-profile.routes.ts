import type { FastifyInstance } from "fastify";
import { HrProfileController } from "../controllers/hr-profile.controller.js";
import { requireAuth, requireRoles } from "../middleware/authMiddleware.js";
import {
  createHrProfileBodyParser,
  createHrProfileSchema,
  updateHrProfileBodyParser,
  updateHrProfileSchema,
} from "../schemas/hr-profile.schema.js";

export async function hrProfileRoutes(
  fastify: FastifyInstance,
  controller: HrProfileController
): Promise<void> {
  fastify.addHook("preHandler", requireAuth);

  fastify.get("/profile", {
    preHandler: requireRoles("hr"),
    handler: controller.getProfile,
  });

  fastify.get("/profile/profile-pic-view-url", {
    preHandler: requireRoles("hr"),
    handler: controller.getProfilePicViewUrl,
  });

  fastify.post("/profile", {
    preHandler: [requireRoles("hr"), createHrProfileBodyParser],
    schema: createHrProfileSchema,
    handler: controller.createProfile,
  });

  fastify.patch("/profile", {
    preHandler: [requireRoles("hr"), updateHrProfileBodyParser],
    schema: updateHrProfileSchema,
    handler: controller.updateProfile,
  });
}
