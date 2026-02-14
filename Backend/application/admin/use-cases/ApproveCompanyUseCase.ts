import { AppError } from "../../../shared/errors/AppError";
import { CompanyApprovalRepository } from "../../../domain/company/repositories/CompanyApprovalRepository";
import { UserRepository } from "../../../domain/user/repositories/UserRepository";

export class ApproveCompanyUseCase {
  constructor(
    private repo: CompanyApprovalRepository,
    private userRepo: UserRepository
  ) { }

  async execute(approvalId: string) {
    const approval = await this.repo.findById(approvalId);

    if (!approval) {
      throw AppError.notFound("Company approval not found");
    }

    approval.approve();

    await this.repo.save(approval);

    // Set companyId on the user so their JWT will include it on next login
    const user = await this.userRepo.findById(approval.userId);
    if (user) {
      user.companyId = approvalId;
      await this.userRepo.save(user);
    }
  }
}
