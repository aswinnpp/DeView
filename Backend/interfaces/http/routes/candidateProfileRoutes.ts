import { FastifyInstance } from "fastify";
import { CandidateProfileController } from "../controllers/CandidateProfileController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

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

    // POST /candidate/profile — create a new profile
    fastify.post("/profile", {
        handler: controller.createProfile,
    });

    // PATCH /candidate/profile — update existing profile
    fastify.patch("/profile", {
        handler: controller.updateProfile,
    });

    // POST /candidate/profile/resume — upload resume file
    fastify.post("/profile/resume", {
        handler: controller.uploadResume,
    });

    console.log("✅ Candidate profile routes registered");
}
