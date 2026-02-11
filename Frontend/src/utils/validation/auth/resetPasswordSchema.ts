import { z } from 'zod';

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
