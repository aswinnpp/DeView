import { z } from 'zod';

const passwordField = z.string().min(1, { message: 'Password is required' });
const strongPasswordField = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .regex(/[a-z]/, { message: 'Password must include at least one lowercase letter' })
  .regex(/[A-Z]/, { message: 'Password must include at least one uppercase letter' })
  .regex(/\d/, { message: 'Password must include at least one number' })
  .regex(/[^A-Za-z0-9]/, { message: 'Password must include at least one special character' });

export const verifyOldPasswordRequestSchema = z.object({
  oldPassword: passwordField,
});

export type VerifyOldPasswordRequest = z.infer<typeof verifyOldPasswordRequestSchema>;

export const changePasswordRequestSchema = z.object({
  oldPassword: passwordField,
  newPassword: strongPasswordField,
});

export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;

