import { injectable, inject } from 'inversify';
import { TYPES } from "../../../infrastructure/di/types";
import { CompanyApprovalRepository } from "../../../domain/company/repositories/CompanyApprovalRepository";
import { AppError } from "../../../shared/errors/AppError";

@injectable()
export class GetMyCompanyApprovalUseCase {
  constructor(@inject(TYPES.CompanyApprovalRepository) private repo: CompanyApprovalRepository) {}

  async execute(userId: string) {
    if (!userId) {
      throw AppError.badRequest("UserId is required");
    }

    const approval = await this.repo.findByUserId(userId);

    if (!approval) {
      throw AppError.notFound("Company approval not found");
    }

    return approval;
  }
}
