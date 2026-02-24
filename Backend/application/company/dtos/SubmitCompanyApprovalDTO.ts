
export interface ISubmitCompanyApprovalDTO {
  userId: string;
  companyName: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  taxId: string;
  website?: string;
  numberOfEmployees: string;
  documents: Record<string, any>;
}
