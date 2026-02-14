import { FastifyInstance } from "fastify";
import { CandidateProfileController } from "../controllers/CandidateProfileController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
    createCandidateProfileSchema,
    updateCandidateProfileSchema,
} from "../schemas/candidateProfileSchema.js";

export async function candidateProfileRoutes(
    fastify: FastifyInstance,
    controller: CandidateProfileController
): Promise<void> {
    // All candidate routes require authentication
    fastify.addHook("preHandler", requireAuth);

    // GET /candidate/profile — fetch current user's profile
    fastify.get("/profile", {
        handler: controller.getProfile,
    });

    // POST /candidate/profile — create a new profile (all required except URL & professional)
    fastify.post("/profile", {
        schema: createCandidateProfileSchema,
        handler: controller.createProfile,
    });

    // PATCH /candidate/profile — update existing profile (all fields optional)
    fastify.patch("/profile", {
        schema: updateCandidateProfileSchema,
        handler: controller.updateProfile,
    });

    // POST /candidate/profile/resume — upload resume file
    fastify.post("/profile/resume", {
        handler: controller.uploadResume,
    });

    console.log("✅ Candidate profile routes registered");
}
