import { z } from 'zod';

// No body required — userId comes from authenticated user
export const checkStatusRequestSchema = z.object({});

export type CheckStatusRequest = z.infer<typeof checkStatusRequestSchema>;
