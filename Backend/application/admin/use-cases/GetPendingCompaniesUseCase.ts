// application/admin/usecases/GetPendingCompaniesUseCase.ts

import { CompanyApprovalRepository } from "../../../domain/company/repositories/CompanyApprovalRepository";

export class GetPendingCompaniesUseCase {
  constructor(private repo: CompanyApprovalRepository) { }

  async execute(search?: string) {
    return await this.repo.searchPending(search);
  }
}
