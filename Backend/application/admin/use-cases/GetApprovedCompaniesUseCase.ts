import { CompanyApprovalRepository } from "../../../domain/company/repositories/CompanyApprovalRepository";

export class GetApprovedCompaniesUseCase {
  constructor(private repo: CompanyApprovalRepository) {}

  async execute(search?: string) {
    const approvals = await this.repo.searchApproved(search);
    return { approvals };
  }
}
