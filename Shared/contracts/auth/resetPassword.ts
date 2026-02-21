import { z } from 'zod';

const emailField = z.string().trim().toLowerCase().email({ message: 'Please enter a valid email' });
const otpField = z.string().trim().regex(/^\d{4}$/, { message: 'OTP must be a 4-digit code' });
const passwordField = z.string().min(6, { message: 'Password must be at least 6 characters' });

export const resetPasswordRequestSchema = z.object({
  email: emailField,
  otp: otpField,
  newPassword: passwordField,
});

export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;

