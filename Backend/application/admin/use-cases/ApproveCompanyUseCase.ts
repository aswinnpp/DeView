// application/admin/usecases/ApproveCompanyUseCase.ts

import { CompanyApprovalRepository } from "../../../domain/company/repositories/CompanyApprovalRepository";

export class ApproveCompanyUseCase {
  constructor(private repo: CompanyApprovalRepository) {}

  async execute(approvalId: string) {
    const approval = await this.repo.findById(approvalId);

    if (!approval) {
      throw new Error("Company approval not found");
    }

    // Domain behavior
    approval.approve();

    // Persist change
    await this.repo.save(approval);
  }
}
