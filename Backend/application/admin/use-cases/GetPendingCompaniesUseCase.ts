import { injectable, inject } from 'inversify';
import { TYPES } from "../../../infrastructure/di/types";
import { CompanyApprovalRepositoryPort } from "../../company/ports/CompanyApprovalRepositoryPort";
import type { GetPendingCompaniesUseCasePort } from "../ports/GetPendingCompaniesUseCasePort";

@injectable()
export class GetPendingCompaniesUseCase implements GetPendingCompaniesUseCasePort {
  constructor(@inject(TYPES.CompanyApprovalRepositoryPort) private repo: CompanyApprovalRepositoryPort) { }

  async execute(search?: string) {
    return await this.repo.searchPending(search);
  }
}
