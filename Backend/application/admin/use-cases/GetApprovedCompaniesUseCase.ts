import { injectable, inject } from 'inversify';
import { TYPES } from "../../../infrastructure/di/types";
import { CompanyApprovalRepository } from "../../../domain/company/repositories/CompanyApprovalRepository";

@injectable()
export class GetApprovedCompaniesUseCase {
  constructor(@inject(TYPES.CompanyApprovalRepository) private repo: CompanyApprovalRepository) {}

  async execute(search?: string) {
    const approvals = await this.repo.searchApproved(search);
    return { approvals };
  }
}
