import { z } from 'zod';

const emailField = z.string().trim().toLowerCase().email({ message: 'Please enter a valid email' });
const otpField = z.string().trim().regex(/^\d{4}$/, { message: 'OTP must be a 4-digit code' });
const strongPasswordField = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .regex(/[a-z]/, { message: 'Password must include at least one lowercase letter' })
  .regex(/[A-Z]/, { message: 'Password must include at least one uppercase letter' })
  .regex(/\d/, { message: 'Password must include at least one number' })
  .regex(/[^A-Za-z0-9]/, { message: 'Password must include at least one special character' });

export const resetPasswordRequestSchema = z.object({
  email: emailField,
  otp: otpField,
  newPassword: strongPasswordField,
});

export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;

