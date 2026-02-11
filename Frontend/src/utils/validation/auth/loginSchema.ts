import { z } from 'zod';
import { loginRequestSchema } from '@shared/contracts/auth/login';

// UI schema (same as request contract for /auth/login)
export const loginSchema = loginRequestSchema;

export type LoginFormValues = z.infer<typeof loginSchema>;
