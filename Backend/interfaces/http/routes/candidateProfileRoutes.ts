import { FastifyInstance } from "fastify";
import { CandidateProfileController } from "../controllers/CandidateProfileController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
    createCandidateProfileSchema,
    updateCandidateProfileSchema,
    uploadResumeSchema,
} from "../schemas/candidateProfileSchema.js";

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

    fastify.post("/profile/resume", {
        schema: uploadResumeSchema,
        handler: controller.uploadResume,
    });

    console.log(" Candidate profile routes registered");
}
