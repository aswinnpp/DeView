import { z } from 'zod';

export const updateCompanyProfileRequestSchema = z.object({
  companyName: z.string().min(1).max(200).optional(),
  address: z.string().min(1).max(500).optional(),
  contactPerson: z.string().min(1).max(100).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().min(10).max(20).optional(),
  taxId: z.string().min(1).max(50).optional(),
  website: z.string().url().optional().or(z.literal('')),
  numberOfEmployees: z.string().min(1).optional(),
}).passthrough(); // Allow additional fields like 'data' wrapper

export type UpdateCompanyProfileRequest = z.infer<typeof updateCompanyProfileRequestSchema>;
