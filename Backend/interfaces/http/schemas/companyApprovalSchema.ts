import { checkStatusRequestSchema } from '../../../../Shared/contracts/companyApproval/checkStatus.js';
import { submitCompanyApprovalRequestSchema } from '../../../../Shared/contracts/companyApproval/submit.js';
import { zodToFastifyBody } from './schemaToFastify.js';

/** POST /check-status — body validated by Fastify from Shared contract */
export const checkStatusSchema = {
  body: zodToFastifyBody(checkStatusRequestSchema),
};

/** POST /submit — body validated by Fastify from Shared contract */
export const submitCompanyApprovalSchema = {
  body: zodToFastifyBody(submitCompanyApprovalRequestSchema),
};
