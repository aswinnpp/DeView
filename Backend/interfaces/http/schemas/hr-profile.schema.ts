import { zodParseBody, zodToFastifyBody } from "./schemaToFastify.js";
import { hrProfileSchema } from "../../../../Shared/contracts/hr/hrProfile.schema.js";

export const createHrProfileSchema = {
  body: zodToFastifyBody(hrProfileSchema),
};

export const updateHrProfileSchema = {
  body: zodToFastifyBody(hrProfileSchema.partial()),
};

export const createHrProfileBodyParser = zodParseBody(hrProfileSchema);
export const updateHrProfileBodyParser = zodParseBody(hrProfileSchema.partial());
