import type { SubmitCompanyApprovalRequest } from '../../../../Shared/contracts/companyApproval/submit';

/** Company approval check + submit — input + output in one module. */

export interface ICheckCompanyStatusInputDTO {
  userId: string;
}

export interface ICheckCompanyStatusOutputDTO {
  status: string;
  rejectionReason?: string | null;
}

export interface ISubmitCompanyApprovalInputDTO extends SubmitCompanyApprovalRequest {
  userId: string;
}

export interface ISubmitCompanyApprovalOutputDTO {
  approvalId: string | null;
}
