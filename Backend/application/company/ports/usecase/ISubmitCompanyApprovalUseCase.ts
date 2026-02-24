import type { ISubmitCompanyApprovalDTO } from "../../dtos/SubmitCompanyApprovalDTO";

export interface ISubmitCompanyApprovalUseCase {
  execute(dto: ISubmitCompanyApprovalDTO): Promise<{ approvalId: string | null }>;
}
