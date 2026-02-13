import { AppError } from "../../../shared/errors/AppError";
import { CompanyApprovalRepository } from "../../../domain/company/repositories/CompanyApprovalRepository";

export class ApproveCompanyUseCase {
  constructor(private repo: CompanyApprovalRepository) {}

  async execute(approvalId: string) {
    const approval = await this.repo.findById(approvalId);

    if (!approval) {
      throw  AppError.notFound("Company approval not found");
    }

    approval.approve();

    await this.repo.save(approval);
  }
}
