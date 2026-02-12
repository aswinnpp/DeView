import { CompanyApprovalRepository } from "../../../domain/company/repositories/CompanyApprovalRepository";
import { CheckCompanyStatusDTO } from "../dtos/CheckCompanyStatusDTO";

export class CheckCompanyStatusUseCase {
  constructor(private repo: CompanyApprovalRepository) {}

  async execute(dto: CheckCompanyStatusDTO) {
    if (!dto.userId) {
      return {
        success: false,
        error: "UserId is required",
      };
    }

    const approval = await this.repo.findById(dto.userId);

    // No approval yet
    if (!approval) {
      return {
        success: true,
        data: {
          status: "none",
        },
      };
    }

    return {
      success: true,
      data: {
        status: approval.status,
        rejectionReason: approval.rejectionReason ?? null,
      },
    };
  }
}
