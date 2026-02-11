import { z } from 'zod';

const emailField = z.string().email({ message: 'Please enter a valid email' });
const passwordField = z.string().min(6, { message: 'Password must be at least 6 characters' });
const fullNameField = z
  .string()
  .min(2, { message: 'Full name must be at least 2 characters' })
  .max(100, { message: 'Full name must be less than 100 characters' });

export const registerRequestSchema = z.object({
  fullName: fullNameField,
  email: emailField,
  password: passwordField,
  role: z.enum(['candidate', 'company']),
  companyName: z.string().min(1).optional(),
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

