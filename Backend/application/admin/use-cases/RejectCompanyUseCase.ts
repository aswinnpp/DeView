import { AppError } from "../../../shared/errors/AppError";
import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { CompanyApprovalRepositoryPort } from "../../company/ports/CompanyApprovalRepositoryPort";
import type { RejectCompanyUseCasePort } from "../ports/RejectCompanyUseCasePort";

@injectable()
export class RejectCompanyUseCase implements RejectCompanyUseCasePort {
  constructor(@inject(TYPES.CompanyApprovalRepositoryPort) private repo: CompanyApprovalRepositoryPort) {}

  async execute(approvalId: string, reason: string) {
    const approval = await this.repo.findById(approvalId);

    if (!approval) {
      throw  AppError.notFound("Company approval not found");
    }

   
    approval.reject(reason);

    
    await this.repo.save(approval);
  }
}
