import { approvalIdParamsSchema, rejectCompanyRequestBodySchema } from '../../../../Shared/contracts/companyApproval/admin.js';
import { zodToFastifyBody, zodToFastifyParams } from './schemaToFastify.js';

const paramsJsonSchema = zodToFastifyParams(approvalIdParamsSchema);
const rejectBodyJsonSchema = zodToFastifyBody(rejectCompanyRequestBodySchema);

export const approveCompanySchema = {
  params: paramsJsonSchema,
};

export const rejectCompanySchema = {
  params: paramsJsonSchema,
  body: rejectBodyJsonSchema,
};
