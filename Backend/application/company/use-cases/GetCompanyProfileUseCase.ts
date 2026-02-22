import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { CompanyProfileRepositoryPort } from "../ports/repository/CompanyProfileRepositoryPort";
import { AppError } from "../../../shared/errors/AppError";
import type { GetCompanyProfileUseCasePort } from "../ports/usecase/GetCompanyProfileUseCasePort";

@injectable()
export class GetCompanyProfileUseCase implements GetCompanyProfileUseCasePort {
  constructor(@inject(TYPES.CompanyProfileRepositoryPort) private repo: CompanyProfileRepositoryPort) {}

  async execute(userId: string) {
    if (!userId) {
      throw AppError.badRequest("UserId is required");
    }

    const profile = await this.repo.findByUserId(userId);

    if (!profile) {
      throw AppError.notFound("Company profile not found");
    }

    return profile;
  }
}
