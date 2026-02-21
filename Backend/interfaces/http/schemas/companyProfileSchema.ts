import { updateCompanyProfileRequestSchema } from '../../../../Shared/contracts/companyProfile/update.js';
import { zodBodyParser } from './zodParser.js';

export const updateCompanyProfileBodyParser = zodBodyParser(updateCompanyProfileRequestSchema);

/** PUT /company/profile — update: all fields optional; when present, validated. */
export const updateCompanyProfileSchema = {};
