import { updateCompanyProfileRequestSchema } from '../../../../Shared/contracts/companyProfile/update.js';
import { zodToFastifyBody } from './schemaToFastify.js';

/** PUT /company/profile — update: all fields optional; when present, validated. */
export const updateCompanyProfileSchema = {
    body: zodToFastifyBody(updateCompanyProfileRequestSchema),
};
