import { FastifyInstance } from "fastify";
import { CandidateProfileController } from "../controllers/candidate-profile.controller.js";
import { requireAuth,requireRoles } from "../middleware/authMiddleware.js";
import {
  createCandidateProfileSchema,
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

    fastify.post("/profile", {
        schema: createCandidateProfileSchema,
        handler: controller.createProfile,
    });

    fastify.patch("/profile", {
        schema: updateCandidateProfileSchema,
        handler: controller.updateProfile,
    });

    fastify.get("/list", {
        preHandler:requireRoles("admin"),
        handler: controller.getAll
    });

 
    console.log(" Candidate profile routes registered");
}
