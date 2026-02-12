import { submitCompanyApprovalRequestSchema } from '@shared/contracts/companyApproval/submit';

export const companyApprovalFormSchema = submitCompanyApprovalRequestSchema;
export type CompanyApprovalFormValues = import('@shared/contracts/companyApproval/submit').SubmitCompanyApprovalRequest;
