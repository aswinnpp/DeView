import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { ICompanyProfileRepository } from "../ports/repository/ICompanyProfileRepository";
import { AppError } from "../../../shared/errors/AppError";
import type { IGetCompanyProfileUseCase } from "../ports/usecase/IGetCompanyProfileUseCase";

@injectable()
export class GetCompanyProfileUseCase implements IGetCompanyProfileUseCase {
  constructor(@inject(TYPES.CompanyProfileRepositoryPort) private repo: ICompanyProfileRepository) {}

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
