import type { FastifyInstance } from "fastify";
import { InterviewerSlotsController } from "../controllers/interviewer-slots.controller.js";
import { requireAuth, requireRoles } from "../middleware/authMiddleware.js";
import { upsertInterviewerSlotsSchema } from "../schemas/interviewer-slots.schema.js";

export async function interviewerSlotsRoutes(
  fastify: FastifyInstance,
  controller: InterviewerSlotsController,
): Promise<void> {
  fastify.addHook("preHandler", requireAuth);

  fastify.get("/slots", {
    preHandler: requireRoles("interviewer"),
    handler: controller.getMySlots,
  });

  fastify.patch("/slots", {
    preHandler: requireRoles("interviewer"),
    schema: upsertInterviewerSlotsSchema,
    handler: controller.upsertMySlots,
  });
}

