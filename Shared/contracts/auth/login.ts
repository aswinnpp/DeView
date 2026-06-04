import { z } from 'zod';

const emailField = z.string().trim().toLowerCase().email({ message: 'Please enter a valid email' });
const passwordField = z.string().min(6, { message: 'Password must be at least 6 characters' });

export const loginRequestSchema = z.object({
  email: emailField,
  password: passwordField,
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

