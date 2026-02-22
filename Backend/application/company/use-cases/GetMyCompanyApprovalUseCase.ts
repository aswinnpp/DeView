import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { CompanyApprovalRepositoryPort } from "../ports/repository/CompanyApprovalRepositoryPort";
import { AppError } from "../../../shared/errors/AppError";
import type { GetMyCompanyApprovalUseCasePort } from "../ports/usecase/GetMyCompanyApprovalUseCasePort";

@injectable()
export class GetMyCompanyApprovalUseCase implements GetMyCompanyApprovalUseCasePort {
  constructor(@inject(TYPES.CompanyApprovalRepositoryPort) private repo: CompanyApprovalRepositoryPort) {}

  async execute(userId: string) {
    if (!userId) {
      throw AppError.badRequest("UserId is required");
    }

    const approval = await this.repo.findByUserId(userId);

    if (!approval) {
      throw AppError.notFound("Company approval needed");
    }

    return approval;
  }
}
