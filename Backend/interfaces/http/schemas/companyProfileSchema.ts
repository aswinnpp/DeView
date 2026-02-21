import { updateCompanyProfileRequestSchema } from '../../../../Shared/contracts/companyProfile/update.js';
import { zodParseBody, zodToFastifyBody } from './schemaToFastify.js';

/** PUT /company/profile — body validated by Fastify from Shared contract (input shape); then flattened via preHandler. */
export const updateCompanyProfileSchema = {
  body: zodToFastifyBody(updateCompanyProfileRequestSchema),
};

/** Runs full schema (including transform) so request.body is always flat for the controller. */
export const updateCompanyProfileBodyParser = zodParseBody(updateCompanyProfileRequestSchema);
