import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { CompanyProfileRepositoryPort } from "../ports/repository/CompanyProfileRepositoryPort";
import { CheckCompanyStatusDTO } from "../dtos/CheckCompanyStatusDTO";
import { AppError } from "../../../shared/errors/AppError";
import type { CheckCompanyStatusUseCasePort } from "../ports/usecase/CheckCompanyStatusUseCasePort";

@injectable()
export class CheckCompanyStatusUseCase implements CheckCompanyStatusUseCasePort {
  constructor(@inject(TYPES.CompanyProfileRepositoryPort) private repo: CompanyProfileRepositoryPort) { }

  async execute(dto: CheckCompanyStatusDTO) {
    if (!dto.userId) {
      throw AppError.badRequest("UserId is required");
    }

    const approval = await this.repo.findByUserId(dto.userId);

    console.log(approval, "approval");
    console.log("dto", dto.userId);



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
