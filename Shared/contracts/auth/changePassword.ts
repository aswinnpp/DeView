import { z } from 'zod';

const passwordField = z.string().min(6, { message: 'Password must be at least 6 characters' });

export const verifyOldPasswordRequestSchema = z.object({
  oldPassword: passwordField,
});

export type VerifyOldPasswordRequest = z.infer<typeof verifyOldPasswordRequestSchema>;

export const changePasswordRequestSchema = z.object({
  oldPassword: passwordField,
  newPassword: passwordField,
});

export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;

