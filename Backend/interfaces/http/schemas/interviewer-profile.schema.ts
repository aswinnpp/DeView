
import { zodToFastifyBody } from "./schemaToFastify.js";
import { interviewerProfileSchema } from "../../../../Shared/contracts/interviewer/interviewerProfile.schema.js";




export const createInterviewerProfileSchema = {
  body: zodToFastifyBody(interviewerProfileSchema),
};

export const updateInterviewerProfileSchema = {
  body: zodToFastifyBody(interviewerProfileSchema.partial()),
};
