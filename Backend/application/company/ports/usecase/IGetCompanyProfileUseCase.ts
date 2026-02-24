import type { CompanyApproval } from "../../../../domain/company/entities/CompanyApprovalEntitie";

export interface IGetCompanyProfileUseCase {
  execute(userId: string): Promise<CompanyApproval>;
}
