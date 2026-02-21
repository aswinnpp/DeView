import { checkStatusRequestSchema } from '../../../../Shared/contracts/companyApproval/checkStatus.js';
import { submitCompanyApprovalRequestSchema } from '../../../../Shared/contracts/companyApproval/submit.js';
import { zodBodyParser } from './zodParser.js';

export const checkStatusBodyParser = zodBodyParser(checkStatusRequestSchema);
export const submitCompanyApprovalBodyParser = zodBodyParser(submitCompanyApprovalRequestSchema);

export const checkStatusSchema = {};
export const submitCompanyApprovalSchema = {};
