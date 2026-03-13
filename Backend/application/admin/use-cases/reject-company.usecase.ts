import { AppError } from "../../../shared/errors/AppError";
import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { ICompanyProfileRepository } from "../../company/ports/repository/ICompanyProfileRepository";
import type { IRejectCompanyUseCase } from "../ports/usecase/IRejectCompanyUseCase";

@injectable()
export class RejectCompanyUseCase implements IRejectCompanyUseCase {
  constructor(@inject(TYPES.CompanyProfileRepositoryPort) private _repo: ICompanyProfileRepository) {}

  async execute(approvalId: string, reason: string) {
    const approval = await this._repo.findById(approvalId);

    if (!approval) {
      throw  AppError.notFound("Company approval not found");
    }

   
    approval.reject(reason);

    
    await this._repo.save(approval);
  }
}
