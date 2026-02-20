import type { CompanyApproval } from "../../../domain/company/entities/CompanyApprovalEntitie";

export interface GetCompanyProfileUseCasePort {
  execute(userId: string): Promise<CompanyApproval>;
}
