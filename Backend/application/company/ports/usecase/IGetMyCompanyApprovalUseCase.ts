import type { CompanyApproval } from "../../../../domain/entities/CompanyApprovalEntitie";

export interface IGetMyCompanyApprovalUseCase {
  execute(userId: string): Promise<CompanyApproval>;
}
