import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { CompanyApprovalRepositoryPort } from "../../company/ports/repository/CompanyApprovalRepositoryPort";
import type { GetApprovedCompaniesUseCasePort } from "../ports/usecase/GetApprovedCompaniesUseCasePort";

@injectable()
export class GetApprovedCompaniesUseCase implements GetApprovedCompaniesUseCasePort {
  constructor(@inject(TYPES.CompanyApprovalRepositoryPort) private repo: CompanyApprovalRepositoryPort) {}

  async execute(search?: string, status?: string, sortOrder?: 'asc' | 'desc', page?: number, limit?: number) {
    const { data, total } = await this.repo.findApproved({ search, status: status as 'active' | 'inactive' | undefined, sortOrder, page, limit });
    return { approvals: data, total };
  }
}
