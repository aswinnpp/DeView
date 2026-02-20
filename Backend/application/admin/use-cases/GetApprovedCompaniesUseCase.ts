import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { CompanyApprovalRepositoryPort } from "../../company/ports/CompanyApprovalRepositoryPort";
import type { GetApprovedCompaniesUseCasePort } from "../ports/GetApprovedCompaniesUseCasePort";

@injectable()
export class GetApprovedCompaniesUseCase implements GetApprovedCompaniesUseCasePort {
  constructor(@inject(TYPES.CompanyApprovalRepositoryPort) private repo: CompanyApprovalRepositoryPort) {}

  async execute(search?: string) {
    const approvals = await this.repo.searchApproved(search);
    return { approvals };
  }
}
