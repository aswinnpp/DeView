// application/admin/usecases/GetPendingCompaniesUseCase.ts

import { injectable, inject } from 'inversify';
import { TYPES } from "../../../infrastructure/di/types";
import { CompanyApprovalRepository } from "../../../domain/company/repositories/CompanyApprovalRepository";

@injectable()
export class GetPendingCompaniesUseCase {
  constructor(@inject(TYPES.CompanyApprovalRepository) private repo: CompanyApprovalRepository) { }

  async execute(search?: string) {
    return await this.repo.searchPending(search);
  }
}
