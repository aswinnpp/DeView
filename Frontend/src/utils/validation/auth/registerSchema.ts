import { z } from 'zod';
import { registerRequestSchema } from '@shared/contracts/auth/register';

export const registerSchema = z
  .object({
    ...registerRequestSchema.shape,
    // UI-only field
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
