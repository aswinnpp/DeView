import { z } from 'zod';

export const checkStatusRequestSchema = z.object({
  userId: z.string().min(1, { message: 'User ID is required' }),
});

export type CheckStatusRequest = z.infer<typeof checkStatusRequestSchema>;
