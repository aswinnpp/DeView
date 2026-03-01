import { z } from 'zod';
import { applyForJobBodySchema } from '../../../../Shared/contracts/application/apply.js';
import { zodToFastifyBody, zodToFastifyParams } from './schemaToFastify.js';

const jobIdParamSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
});

export const applyForJobSchema = {
  body: zodToFastifyBody(applyForJobBodySchema),
  params: zodToFastifyParams(jobIdParamSchema),
};
