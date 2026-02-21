import { checkStatusRequestSchema } from '../../../../Shared/contracts/companyApproval/checkStatus.js';
import { submitCompanyApprovalRequestSchema } from '../../../../Shared/contracts/companyApproval/submit.js';
import { zodToFastifyBody } from './schemaToFastify.js';

export const checkStatusSchema = {
  body: zodToFastifyBody(checkStatusRequestSchema),
};

export const submitCompanyApprovalSchema = {
  body: zodToFastifyBody(submitCompanyApprovalRequestSchema),
};
