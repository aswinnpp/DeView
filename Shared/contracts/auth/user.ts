import { z } from 'zod';

export const userContractSchema = z.object({
    id: z.string(),
    fullName: z.string(),
    email: z.string().email(),
    role: z.string(),
    isActive: z.boolean(),
    isEmailVerified: z.boolean(),
    createdAt: z.string().datetime(),
});

export type UserContract = z.infer<typeof userContractSchema>;
