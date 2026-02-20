import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { CompanyApprovalRepositoryPort } from "../../company/ports/repository/CompanyApprovalRepositoryPort";
import type { GetPendingCompaniesUseCasePort } from "../ports/usecase/GetPendingCompaniesUseCasePort";

@injectable()
export class GetPendingCompaniesUseCase implements GetPendingCompaniesUseCasePort {
  constructor(@inject(TYPES.CompanyApprovalRepositoryPort) private repo: CompanyApprovalRepositoryPort) { }

  async execute(search?: string) {
    return await this.repo.findPending({ search });
  }
}
