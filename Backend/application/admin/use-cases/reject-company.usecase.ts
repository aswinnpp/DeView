import { AppError } from '../../../shared/errors/AppError';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types';
import { ICompanyProfileRepository } from '../../company/ports/repository/ICompanyProfileRepository';
import type { IRejectCompanyInputDTO } from '../dtos/AdminCompanyMutationsDTO.js';
import type { IRejectCompanyUseCase } from '../ports/usecase/IRejectCompanyUseCase.js';

@injectable()
export class RejectCompanyUseCase implements IRejectCompanyUseCase {
  constructor(@inject(TYPES.CompanyProfileRepositoryPort) private _repo: ICompanyProfileRepository) {}

  async execute(input: IRejectCompanyInputDTO) {
    const { approvalId, reason } = input;
    const approval = await this._repo.findById(approvalId);

    if (!approval) {
      throw AppError.notFound('Company approval not found');
    }

    approval.reject(reason);

    await this._repo.save(approval);

    return { ok: true as const };
  }
}
