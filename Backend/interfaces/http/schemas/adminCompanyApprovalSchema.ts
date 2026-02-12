import { approvalIdParamsSchema, rejectCompanyRequestBodySchema } from '../../../../Shared/contracts/companyApproval/admin.js';
import { zodToFastifyBody, zodToFastifyParams } from './schemaToFastify.js';

export const approveCompanySchema = {
    params: zodToFastifyParams(approvalIdParamsSchema),
};

export const rejectCompanySchema = {
    params: zodToFastifyParams(approvalIdParamsSchema),
    body: zodToFastifyBody(rejectCompanyRequestBodySchema),
};
