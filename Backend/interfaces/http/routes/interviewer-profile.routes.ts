import type { FastifyInstance } from "fastify";
import { InterviewerProfileController } from "../controllers/interviewer-profile.controller.js";
import { requireAuth, requireRoles } from "../middleware/authMiddleware.js";
import {
  createInterviewerProfileSchema,
  updateInterviewerProfileSchema,
} from "../schemas/interviewer-profile.schema.js";

export async function interviewerProfileRoutes(
  fastify: FastifyInstance,
  controller: InterviewerProfileController
): Promise<void> {
  fastify.addHook("preHandler", requireAuth);

  fastify.get("/profile", {
    preHandler: requireRoles("interviewer"),
    handler: controller.getProfile,
  });

  fastify.get("/profile/profile-pic-view-url", {
    preHandler: requireRoles("interviewer"),
    handler: controller.getProfilePicViewUrl,
  });

  fastify.post("/profile", {
    preHandler: requireRoles("interviewer"),
    schema: createInterviewerProfileSchema,
    handler: controller.createProfile,
  });

  fastify.patch("/profile", {
    preHandler: requireRoles("interviewer"),
    schema: updateInterviewerProfileSchema,
    handler: controller.updateProfile,
  });
}
