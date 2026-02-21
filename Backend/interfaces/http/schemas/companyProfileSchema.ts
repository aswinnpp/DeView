import { updateCompanyProfileRequestSchema } from '../../../../Shared/contracts/companyProfile/update.js';
import { zodParseBody, zodToFastifyBody } from './schemaToFastify.js';

export const updateCompanyProfileSchema = {
  body: zodToFastifyBody(updateCompanyProfileRequestSchema),
};

export const updateCompanyProfileBodyParser = zodParseBody(updateCompanyProfileRequestSchema);
