import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { ICompanyProfileRepository } from "../ports/repository/ICompanyProfileRepository";
import { ICheckCompanyStatusDTO } from "../dtos/CheckCompanyStatusDTO";
import { AppError } from "../../../shared/errors/AppError";
import type { ICheckCompanyStatusUseCase } from "../ports/usecase/ICheckCompanyStatusUseCase";

@injectable()
export class CheckCompanyStatusUseCase implements ICheckCompanyStatusUseCase {
  constructor(@inject(TYPES.CompanyProfileRepositoryPort) private _repo: ICompanyProfileRepository) { }

  async execute(dto: ICheckCompanyStatusDTO) {
    if (!dto.userId) {
      throw AppError.badRequest("UserId is required");
    }

    const approval = await this._repo.findByUserId(dto.userId);





    if (!approval) {
      return {
        status: "none",
      };
    }

    return {
      status: approval.status,
      rejectionReason: approval.rejectionReason ?? null,

    };
  }
}
