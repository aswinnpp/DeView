import { jobFormSchema, jobUpdateSchema, jobStatusEnum } from '../../../../Shared/contracts/job/form.js';
import { z } from 'zod';
import { zodToFastifyBody, zodToFastifyParams } from './schemaToFastify.js';

const jobIdParamSchema = z.object({
  id: z.string().min(1),
});

const jobStatusBodySchema = z.object({
  status: jobStatusEnum,
});

export const createJobSchema = {
  body: zodToFastifyBody(jobFormSchema),
};

export const updateJobSchema = {
  body: zodToFastifyBody(jobUpdateSchema),
  params: zodToFastifyParams(jobIdParamSchema),
};

export const toggleJobStatusSchema = {
  body: zodToFastifyBody(jobStatusBodySchema),
  params: zodToFastifyParams(jobIdParamSchema),
};

