import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { CompanyApprovalRepositoryPort } from "../../company/ports/repository/CompanyApprovalRepositoryPort";
import { parseSearchParams } from "../../shared/utils/parseSearchParams";
import type { GetPendingCompaniesUseCasePort } from "../ports/usecase/GetPendingCompaniesUseCasePort";

@injectable()
export class GetPendingCompaniesUseCase implements GetPendingCompaniesUseCasePort {
  constructor(@inject(TYPES.CompanyApprovalRepositoryPort) private repo: CompanyApprovalRepositoryPort) { }

  async execute(search?: string, sortOrder?: 'asc' | 'desc', page?: string, limit?: string) {
    const { page: parsedPage, limit: parsedLimit } = parseSearchParams({ page, limit });
    return await this.repo.findPending({ search, sortOrder, page: parsedPage, limit: parsedLimit });
  }
}
