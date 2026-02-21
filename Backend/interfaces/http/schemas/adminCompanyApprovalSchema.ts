import { approvalIdParamsSchema, rejectCompanyRequestBodySchema } from '../../../../Shared/contracts/companyApproval/admin.js';
import { zodToFastifyBody, zodToFastifyParams } from './schemaToFastify.js';

const paramsJsonSchema = zodToFastifyParams(approvalIdParamsSchema);
const rejectBodyJsonSchema = zodToFastifyBody(rejectCompanyRequestBodySchema);

/** POST /:id/approve — params validated by Fastify from Shared contract */
export const approveCompanySchema = {
  params: paramsJsonSchema,
};

/** POST /:id/reject — params + body validated by Fastify from Shared contract */
export const rejectCompanySchema = {
  params: paramsJsonSchema,
  body: rejectBodyJsonSchema,
};
