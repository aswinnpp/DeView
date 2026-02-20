import type { SubmitCompanyApprovalDTO } from "../dtos/SubmitCompanyApprovalDTO";

export interface SubmitCompanyApprovalUseCasePort {
  execute(dto: SubmitCompanyApprovalDTO): Promise<{ approvalId: string | null }>;
}
