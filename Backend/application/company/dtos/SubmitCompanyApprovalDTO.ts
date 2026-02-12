
export interface SubmitCompanyApprovalDTO {
  userId: string;
  companyName: string;
  address: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  taxId: string;
  website?: string;
  numberOfEmployees: string;
  documents: Record<string, any>;
}
