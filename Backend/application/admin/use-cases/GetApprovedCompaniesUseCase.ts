import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { CompanyProfileRepositoryPort } from "../../company/ports/repository/CompanyProfileRepositoryPort";
import { parseSearchParams } from "../../shared/utils/parseSearchParams";
import type { GetApprovedCompaniesUseCasePort } from "../ports/usecase/GetApprovedCompaniesUseCasePort";

@injectable()
export class GetApprovedCompaniesUseCase implements GetApprovedCompaniesUseCasePort {
  constructor(@inject(TYPES.CompanyProfileRepositoryPort) private repo: CompanyProfileRepositoryPort) {}

  async execute(search?: string, status?: string, sortOrder?: 'asc' | 'desc', page?: string, limit?: string) {
    const { page: parsedPage, limit: parsedLimit } = parseSearchParams({ page, limit });
    const { data, total } = await this.repo.findApproved({ search, status: status as 'active' | 'inactive' | undefined, sortOrder, page: parsedPage, limit: parsedLimit });
    return { approvals: data, total };
  }
}
