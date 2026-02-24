import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { ICompanyProfileRepository } from "../../company/ports/repository/ICompanyProfileRepository";
import { parseSearchParams } from "../../shared/utils/parseSearchParams";
import type { IGetPendingCompaniesUseCase } from "../ports/usecase/IGetPendingCompaniesUseCase";

@injectable()
export class GetPendingCompaniesUseCase implements IGetPendingCompaniesUseCase {
  constructor(@inject(TYPES.CompanyProfileRepositoryPort) private repo: ICompanyProfileRepository) { }

  async execute(search?: string, sortOrder?: 'asc' | 'desc', page?: string, limit?: string) {
    const { page: parsedPage, limit: parsedLimit } = parseSearchParams({ page, limit });
    return await this.repo.findPending({ search, sortOrder, page: parsedPage, limit: parsedLimit });
  }
}
