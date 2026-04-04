import { FastifyInstance } from "fastify";
import { CandidateProfileController } from "../controllers/candidate-profile.controller.js";
import { requireAuth,requireRoles } from "../middleware/authMiddleware.js";
import {
  createCandidateProfileBodyParser,
  createCandidateProfileSchema,
  updateCandidateProfileBodyParser,
  updateCandidateProfileSchema,
} from "../schemas/candidate-profile.schema.js";

export async function candidateProfileRoutes(
    fastify: FastifyInstance,
    controller: CandidateProfileController
): Promise<void> {
    fastify.addHook("preHandler", requireAuth);
   
    
    fastify.get("/profile", {
        handler: controller.getProfile,
    });

    fastify.get("/profile/resume-view-url", {
        handler: controller.getResumeViewUrl,
    });

    fastify.get("/profile/profile-pic-view-url", {
        handler: controller.getProfilePicViewUrl,
    });

    fastify.post("/profile", {
        preHandler: createCandidateProfileBodyParser,
        schema: createCandidateProfileSchema,
        handler: controller.createProfile,
    });

    fastify.patch("/profile", {
        preHandler: updateCandidateProfileBodyParser,
        schema: updateCandidateProfileSchema,
        handler: controller.updateProfile,
    });

    fastify.get("/list", {
        preHandler:requireRoles("admin"),
        handler: controller.getAll
    });

 
} 
