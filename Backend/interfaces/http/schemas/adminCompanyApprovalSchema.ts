import { approvalIdParamsSchema, rejectCompanyRequestBodySchema } from '../../../../Shared/contracts/companyApproval/admin.js';
import { zodBodyParser, zodParamsParser } from './zodParser.js';

export const approvalIdParamsParser = zodParamsParser(approvalIdParamsSchema);
export const rejectCompanyBodyParser = zodBodyParser(rejectCompanyRequestBodySchema);

export const approveCompanySchema = {};
export const rejectCompanySchema = {};
