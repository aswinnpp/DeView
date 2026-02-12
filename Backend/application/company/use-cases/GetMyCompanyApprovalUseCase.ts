import { CompanyApprovalRepository } from "../../../domain/company/repositories/CompanyApprovalRepository";

export class GetMyCompanyApprovalUseCase {
  constructor(private repo: CompanyApprovalRepository) {}

  async execute(userId: string) {
    const approval = await this.repo.findByUserId(userId);

    if (!approval) {
      return null;
    }

    return approval;
  }
}
