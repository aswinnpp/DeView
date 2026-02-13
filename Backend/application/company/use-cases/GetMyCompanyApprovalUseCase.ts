import { CompanyApprovalRepository } from "../../../domain/company/repositories/CompanyApprovalRepository";
import { AppError } from "../../../shared/errors/AppError";

export class GetMyCompanyApprovalUseCase {
  constructor(private repo: CompanyApprovalRepository) {}

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
