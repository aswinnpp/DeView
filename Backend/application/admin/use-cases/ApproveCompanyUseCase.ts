import { AppError } from "../../../shared/errors/AppError";
import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { ICompanyProfileRepository } from "../../company/ports/repository/ICompanyProfileRepository";
import { IUserRepository } from "../../shared/ports/repository/IUserRepository";
import type { IApproveCompanyUseCase } from "../ports/usecase/IApproveCompanyUseCase";

@injectable()
export class ApproveCompanyUseCase implements IApproveCompanyUseCase {
  constructor(
    @inject(TYPES.CompanyProfileRepositoryPort) private repo: ICompanyProfileRepository,
    @inject(TYPES.UserRepositoryPort) private userRepo: IUserRepository
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
