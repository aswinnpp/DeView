import { zodToFastifyBody } from "./schemaToFastify.js";
import { interviewerSlotsUpsertSchema } from "../../../../Shared/contracts/interviewer/interviewerSlots.schema.js";

export const upsertInterviewerSlotsSchema = {
  body: zodToFastifyBody(interviewerSlotsUpsertSchema),
};

