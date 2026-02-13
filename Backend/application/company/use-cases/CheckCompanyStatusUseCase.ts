import { CompanyApprovalRepository } from "../../../domain/company/repositories/CompanyApprovalRepository";
import { CheckCompanyStatusDTO } from "../dtos/CheckCompanyStatusDTO";
import { AppError } from "../../../shared/errors/AppError";
import { arrayProcessor } from "zod/v4/core/json-schema-processors.cjs";

export class CheckCompanyStatusUseCase {
  constructor(private repo: CompanyApprovalRepository) {}

  async execute(dto: CheckCompanyStatusDTO) {
    if (!dto.userId) {
      throw AppError.badRequest("UserId is required");
    }

    const approval = await this.repo.findByUserId(dto.userId);

    console.log(approval,"approval");
    console.log("dto" ,dto.userId);
    
    

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
