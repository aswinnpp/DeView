import { z } from 'zod';

export const otpSchema = z.object({
  otpCode: z.string().regex(/^\d{4}$/, { message: 'OTP must be a 4-digit code' }),
});

export type OtpFormValues = z.infer<typeof otpSchema>;
