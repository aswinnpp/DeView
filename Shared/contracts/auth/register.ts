import { z } from 'zod';

const emailField = z.string().trim().toLowerCase().email({ message: 'Please enter a valid email' });
const strongPasswordField = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .regex(/[a-z]/, { message: 'Password must include at least one lowercase letter' })
  .regex(/[A-Z]/, { message: 'Password must include at least one uppercase letter' })
  .regex(/\d/, { message: 'Password must include at least one number' })
  .regex(/[^A-Za-z0-9]/, { message: 'Password must include at least one special character' });
const fullNameField = z
  .string()
  .trim()
  .min(2, { message: 'Full name must be at least 2 characters' })
  .max(100, { message: 'Full name must be less than 100 characters' });

export const registerRequestSchema = z.object({
  fullName: fullNameField,
  email: emailField,
  password: strongPasswordField,
  role: z.enum(['candidate', 'company']),
  companyId: z.string().trim().min(1).optional(),
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

