import { z } from 'zod';

const emailField = z.string().trim().toLowerCase().email({ message: 'Please enter a valid email' });
const otpField = z.string().trim().regex(/^\d{4}$/, { message: 'OTP must be a 4-digit code' });

export const verifyOtpRequestSchema = z.object({
  email: emailField,
  otp: otpField,
});

export type VerifyOtpRequest = z.infer<typeof verifyOtpRequestSchema>;

export const resendOtpRequestSchema = z.object({
  email: emailField,
});

export type ResendOtpRequest = z.infer<typeof resendOtpRequestSchema>;

