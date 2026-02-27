import { z } from 'zod';


export const approvalIdParamsSchema = z.object({
  id: z.string().trim().min(1, { message: 'Approval ID is required' }),
});

export type ApprovalIdParams = z.infer<typeof approvalIdParamsSchema>;


export const rejectCompanyRequestBodySchema = z.object({
  reason: z
    .string()
    .min(1, { message: 'Rejection reason is required' })
    .max(1000, { message: 'Reason must be less than 1000 characters' })
    .trim(),
});

export type RejectCompanyRequestBody = z.infer<typeof rejectCompanyRequestBodySchema>;
