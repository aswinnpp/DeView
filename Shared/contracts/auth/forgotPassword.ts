import { z } from 'zod';

const emailField = z.string().email({ message: 'Please enter a valid email' });

export const forgotPasswordRequestSchema = z.object({
  email: emailField,
});

export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;

