import { z } from 'zod';

export const checkStatusRequestSchema = z.object({});

export type CheckStatusRequest = z.infer<typeof checkStatusRequestSchema>;
