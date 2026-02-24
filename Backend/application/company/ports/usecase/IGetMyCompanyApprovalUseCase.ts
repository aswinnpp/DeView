import type { CompanyApproval } from "../../../../domain/company/entities/CompanyApprovalEntitie";

export interface IGetMyCompanyApprovalUseCase {
  execute(userId: string): Promise<CompanyApproval>;
}
