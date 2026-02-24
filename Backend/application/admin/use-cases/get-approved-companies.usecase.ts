import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { ICompanyProfileRepository } from "../../company/ports/repository/ICompanyProfileRepository";
import { parseSearchParams } from "../../shared/utils/parseSearchParams";
import type { IGetApprovedCompaniesUseCase } from "../ports/usecase/IGetApprovedCompaniesUseCase";

@injectable()
export class GetApprovedCompaniesUseCase implements IGetApprovedCompaniesUseCase {
  constructor(@inject(TYPES.CompanyProfileRepositoryPort) private repo: ICompanyProfileRepository) {}

  async execute(search?: string, status?: string, sortOrder?: 'asc' | 'desc', page?: string, limit?: string) {
    const { page: parsedPage, limit: parsedLimit } = parseSearchParams({ page, limit });
    const { data, total } = await this.repo.findApproved({ search, status: status as 'active' | 'inactive' | undefined, sortOrder, page: parsedPage, limit: parsedLimit });
    return { approvals: data, total };
  }
}
