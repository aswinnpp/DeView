import { AppError } from "../../../shared/errors/AppError";
import { injectable, inject } from 'inversify';
import { TYPES } from "../../../infrastructure/di/types";
import { CompanyApprovalRepository } from "../../../domain/company/repositories/CompanyApprovalRepository";
import { UserRepository } from "../../../domain/user/repositories/UserRepository";

@injectable()
export class ApproveCompanyUseCase {
  constructor(
    @inject(TYPES.CompanyApprovalRepository) private repo: CompanyApprovalRepository,
    @inject(TYPES.UserRepository) private userRepo: UserRepository
  ) { }

  async execute(approvalId: string) {
    const approval = await this.repo.findById(approvalId);

    if (!approval) {
      throw AppError.notFound("Company approval not found");
    }

    console.log("aa",approval);
    

    approval.approve();

    await this.repo.save(approval);

    const user = await this.userRepo.findById(approval.userId);
    if (user) {
      user.companyId = approvalId;
      await this.userRepo.save(user);
    }
  }
}
