import { z } from 'zod';

const emailField = z.string().trim().toLowerCase().email({ message: 'Please enter a valid email' });
const strongPasswordField = z
  .string()
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
    {
      message:
        'Password must contain: 8+ characters, [a-z], [A-Z], [0-9], [@#$%^&*...]',
    }
  );

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

