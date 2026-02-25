
import type { SubmitCompanyApprovalRequest } from "../../../../Shared/contracts/companyApproval/submit";

export interface ISubmitCompanyApprovalDTO extends SubmitCompanyApprovalRequest {
  userId: string;
}
