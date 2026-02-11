import { z } from 'zod';
import { verifyOtpRequestSchema } from '@shared/contracts/auth/otp';

export const otpSchema = z.object({
  // UI uses otpCode, backend contract uses otp
  otpCode: verifyOtpRequestSchema.shape.otp,
});

export type OtpFormValues = z.infer<typeof otpSchema>;
