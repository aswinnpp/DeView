import type { CompanyApproval } from "../../../domain/company/entities/CompanyApprovalEntitie";

export interface GetMyCompanyApprovalUseCasePort {
  execute(userId: string): Promise<CompanyApproval>;
}
