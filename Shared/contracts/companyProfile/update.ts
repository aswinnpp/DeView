import { z } from 'zod';

const flatFieldsSchema = z.object({
  companyName: z.string().trim().min(1).max(200).optional(),
  location: z.string().trim().min(1).max(200).optional(),
  address: z.string().trim().min(1).max(500).optional(),
  contactPerson: z.string().trim().min(1).max(100).optional(),
  contactEmail: z.string().trim().toLowerCase().email().optional(),
  contactPhone: z.string().trim().min(10).max(20).optional(),
  taxId: z.string().trim().min(1).max(50).optional(),
  website: z.string().trim().url().optional().or(z.literal('')),
  numberOfEmployees: z.string().trim().min(1).optional(),
  logoUrl: z.string().trim().optional(),
});


export const updateCompanyProfileRequestSchema = z.union([
  flatFieldsSchema,
  z.object({ data: flatFieldsSchema }),
]).transform((val) => ('data' in val ? val.data : val));

export type UpdateCompanyProfileRequest = z.infer<typeof flatFieldsSchema>;
