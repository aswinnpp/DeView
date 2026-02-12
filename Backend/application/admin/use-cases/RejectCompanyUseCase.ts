// application/admin/usecases/RejectCompanyUseCase.ts

import { CompanyApprovalRepository } from "../../../domain/company/repositories/CompanyApprovalRepository";

export class RejectCompanyUseCase {
  constructor(private repo: CompanyApprovalRepository) {}

  async execute(approvalId: string, reason: string) {
    const approval = await this.repo.findById(approvalId);

    if (!approval) {
      throw new Error("Company approval not found");
    }

    // Domain behavior
    approval.reject(reason);

    // Persist change
    await this.repo.save(approval);
  }
}
