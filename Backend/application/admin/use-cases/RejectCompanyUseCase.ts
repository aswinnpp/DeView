import { AppError } from "../../../shared/errors/AppError";
import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { CompanyProfileRepositoryPort } from "../../company/ports/repository/CompanyProfileRepositoryPort";
import type { RejectCompanyUseCasePort } from "../ports/usecase/RejectCompanyUseCasePort";

@injectable()
export class RejectCompanyUseCase implements RejectCompanyUseCasePort {
  constructor(@inject(TYPES.CompanyProfileRepositoryPort) private repo: CompanyProfileRepositoryPort) {}

  async execute(approvalId: string, reason: string) {
    const approval = await this.repo.findById(approvalId);

    if (!approval) {
      throw  AppError.notFound("Company approval not found");
    }

   
    approval.reject(reason);

    
    await this.repo.save(approval);
  }
}
