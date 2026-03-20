import type { CompanyApproval } from "../../../../domain/entities/CompanyApprovalEntitie";

export interface IGetCompanyProfileUseCase {
  execute(userId: string): Promise<CompanyApproval>;
}
