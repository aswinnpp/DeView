import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { ICompanyProfileRepository } from "../ports/repository/ICompanyProfileRepository";
import { AppError } from "../../../shared/errors/AppError";
import type { IGetMyCompanyApprovalUseCase } from "../ports/usecase/IGetMyCompanyApprovalUseCase";

@injectable()
export class GetMyCompanyApprovalUseCase implements IGetMyCompanyApprovalUseCase {
  constructor(@inject(TYPES.CompanyProfileRepositoryPort) private _repo: ICompanyProfileRepository) {}

  async execute(userId: string) {
    if (!userId) {
      throw AppError.badRequest("UserId is required");
    }

    const approval = await this._repo.findByUserId(userId);

    if (!approval) {
      throw AppError.notFound("Company approval needed");
    }

    return approval;
  }
}
