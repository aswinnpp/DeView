import { z } from 'zod';
import { resetPasswordRequestSchema } from '@shared/contracts/auth/resetPassword';

export const resetPasswordSchema = z
  .object({
    newPassword: resetPasswordRequestSchema.shape.newPassword,
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
