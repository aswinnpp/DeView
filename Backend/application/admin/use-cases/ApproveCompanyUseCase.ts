import { AppError } from "../../../shared/errors/AppError";
import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { CompanyApprovalRepositoryPort } from "../../company/ports/repository/CompanyApprovalRepositoryPort";
import { UserRepositoryPort } from "../../shared/ports/repository/UserRepositoryPort";
import type { ApproveCompanyUseCasePort } from "../ports/usecase/ApproveCompanyUseCasePort";

@injectable()
export class ApproveCompanyUseCase implements ApproveCompanyUseCasePort {
  constructor(
    @inject(TYPES.CompanyApprovalRepositoryPort) private repo: CompanyApprovalRepositoryPort,
    @inject(TYPES.UserRepositoryPort) private userRepo: UserRepositoryPort
  ) { }

  async execute(approvalId: string) {
    const approval = await this.repo.findById(approvalId);

    if (!approval) {
      throw AppError.notFound("Company approval not found");
    }

    

    approval.approve();

    await this.repo.save(approval);

    const user = await this.userRepo.findById(approval.userId);
    if (user) {
      user.companyId = approvalId;
      await this.userRepo.save(user);
    }
  }
}
