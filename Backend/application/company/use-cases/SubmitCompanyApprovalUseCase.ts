import { CompanyApprovalRepository } from "../../../domain/company/repositories/CompanyApprovalRepository";
import { CompanyApproval } from "../../../domain/company/entities/CompanyApprovalEntitie";
import { SubmitCompanyApprovalDTO } from "../dtos/SubmitCompanyApprovalDTO";

export class SubmitCompanyApprovalUseCase {
  constructor(private repo: CompanyApprovalRepository) {}

  async execute(dto: SubmitCompanyApprovalDTO) {
    if (!dto.userId) {
      return {
        success: false,
        error: "UserId is required",
      };
    }

    const existing = await this.repo.findById(dto.userId);

    if (existing && existing.status === "pending") {
      return {
        success: false,
        error: "You already have a pending approval request",
      };
    }

    if (existing && existing.status === "approved") {
      return {
        success: false,
        error: "Company already approved",
      };
    }

    // Create domain entity
    const approval = new CompanyApproval(
      null,
      dto.userId,
      dto.companyName,
      dto.address,
      dto.contactPerson,
      dto.contactEmail,
      dto.contactPhone,
      dto.taxId,
      dto.numberOfEmployees,
      dto.documents,
      dto.website
    );

    const approvalId = await this.repo.save(approval);

    return {
      success: true,
      data: approvalId,
    };
  }
}
