// application/admin/usecases/GetPendingCompaniesUseCase.ts

import { CompanyApprovalRepository } from "../../../domain/company/repositories/CompanyApprovalRepository";

export class GetPendingCompaniesUseCase {
  constructor(private repo: CompanyApprovalRepository) {}

  async execute() {
    return await this.repo.findPending();
  }
}
