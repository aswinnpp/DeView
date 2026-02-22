import { z } from 'zod';

const documentUploadSchema = z.object({
  fileName: z.string().trim().min(1),
  fileUrl: z.string().trim().min(1),
  uploadedAt: z.string().trim(),
  marked: z.boolean(),
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
    data.authorizedSignatoryId &&
    data.bankDocument,
  { message: 'All required documents must be uploaded' }
);

export const submitCompanyApprovalRequestSchema = z.object({
  companyName: z.string().trim().min(1, { message: 'Company name is required' }).max(200),
  address: z.string().trim().min(1, { message: 'Address is required' }).max(500),
  contactPerson: z.string().trim().min(1, { message: 'Contact person is required' }).max(100),
  contactPhone: z.string().trim().min(10, { message: 'Phone must be at least 10 digits' }).max(20),
  taxId: z.string().trim().min(1, { message: 'Tax ID is required' }).max(50),
  website: z.string().trim().optional(),
  numberOfEmployees: z.string().trim().min(1, { message: 'Number of employees is required' }),
  documents: documentsSchema,
});

export type SubmitCompanyApprovalRequest = z.infer<typeof submitCompanyApprovalRequestSchema>;
