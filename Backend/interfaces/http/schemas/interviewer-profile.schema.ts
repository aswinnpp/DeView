import { zodParseBody, zodToFastifyBody } from "./schemaToFastify.js";
import { interviewerProfileSchema } from "../../../../Shared/contracts/interviewer/interviewerProfile.schema.js";

export const createInterviewerProfileSchema = {
  body: zodToFastifyBody(interviewerProfileSchema),
};

export const updateInterviewerProfileSchema = {
  body: zodToFastifyBody(interviewerProfileSchema.partial()),
};

export const createInterviewerProfileBodyParser = zodParseBody(interviewerProfileSchema);
export const updateInterviewerProfileBodyParser = zodParseBody(interviewerProfileSchema.partial());
