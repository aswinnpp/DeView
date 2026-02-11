import { z } from 'zod';
import { forgotPasswordRequestSchema } from '@shared/contracts/auth/forgotPassword';

// UI schema (same as request contract for /auth/forgot-password)
export const forgotPasswordSchema = forgotPasswordRequestSchema;

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
