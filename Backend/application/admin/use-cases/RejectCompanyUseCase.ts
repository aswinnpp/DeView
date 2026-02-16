import { AppError } from "../../../shared/errors/AppError";
import { injectable, inject } from 'inversify';
import { TYPES } from "../../../infrastructure/di/types";
import { CompanyApprovalRepository } from "../../../domain/company/repositories/CompanyApprovalRepository";

@injectable()
export class RejectCompanyUseCase {
  constructor(@inject(TYPES.CompanyApprovalRepository) private repo: CompanyApprovalRepository) {}

  async execute(approvalId: string, reason: string) {
    const approval = await this.repo.findById(approvalId);

    if (!approval) {
      throw  AppError.notFound("Company approval not found");
    }

   
    approval.reject(reason);

    
    await this.repo.save(approval);
  }
}
