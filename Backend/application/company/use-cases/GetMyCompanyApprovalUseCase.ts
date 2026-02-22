import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { CompanyProfileRepositoryPort } from "../ports/repository/CompanyProfileRepositoryPort";
import { AppError } from "../../../shared/errors/AppError";
import type { GetMyCompanyApprovalUseCasePort } from "../ports/usecase/GetMyCompanyApprovalUseCasePort";

@injectable()
export class GetMyCompanyApprovalUseCase implements GetMyCompanyApprovalUseCasePort {
  constructor(@inject(TYPES.CompanyProfileRepositoryPort) private repo: CompanyProfileRepositoryPort) {}

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
