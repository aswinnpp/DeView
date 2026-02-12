import { z } from 'zod';

const documentUploadSchema = z.object({
  fileName: z.string().min(1),
  fileUrl: z.string().url(),
  uploadedAt: z.union([z.string()]),
});

const documentsSchema = z.object({
  certificateOfIncorporation: documentUploadSchema.optional(),
  gstCertificate: documentUploadSchema.optional(),
  panCard: documentUploadSchema.optional(),
  addressProof: documentUploadSchema.optional(),
  authorizedSignatoryId: documentUploadSchema.optional(),
  bankDocument: documentUploadSchema.optional(),
}).refine(
  (data) =>
    data.certificateOfIncorporation &&
    data.gstCertificate &&
    data.panCard &&
    data.addressProof &&
    data.authorizedSignatoryId,
  { message: 'All required documents must be uploaded' }
);

export const submitCompanyApprovalRequestSchema = z.object({
  companyName: z.string().min(1, { message: 'Company name is required' }).max(200),
  address: z.string().min(1, { message: 'Address is required' }).max(500),
  contactPerson: z.string().min(1, { message: 'Contact person is required' }).max(100),
  contactEmail: z.string().email({ message: 'Valid email is required' }),
  contactPhone: z.string().min(10, { message: 'Phone must be at least 10 digits' }).max(20),
  taxId: z.string().min(1, { message: 'Tax ID is required' }).max(50),
  website: z.string().optional(),
  numberOfEmployees: z.string().min(1, { message: 'Number of employees is required' }),
  documents: documentsSchema,
});

export type SubmitCompanyApprovalRequest = z.infer<typeof submitCompanyApprovalRequestSchema>;
