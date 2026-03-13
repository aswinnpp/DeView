import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { ICompanyProfileRepository } from '../ports/repository/ICompanyProfileRepository.js';
import type {
  IActivatePendingSubscriptionNowInput,
  IActivatePendingSubscriptionNowUseCase,
} from '../ports/usecase/IActivatePendingSubscriptionNowUseCase.js';
import { AppError } from '../../../shared/errors/AppError.js';

@injectable()
export class ActivatePendingSubscriptionNowUseCase
  implements IActivatePendingSubscriptionNowUseCase
{
  constructor(
    @inject(TYPES.CompanyProfileRepositoryPort)
    private readonly _companyProfileRepository: ICompanyProfileRepository,
  ) {}

  async execute(input: IActivatePendingSubscriptionNowInput): Promise<void> {
    const { companyId, pendingSubscriptionId } = input;

    const company = await this._companyProfileRepository.findById(companyId);
    if (!company) {
      throw AppError.notFound('Company not found');
    }

    const now = new Date();
    company.activatePendingNow(pendingSubscriptionId, now);
    await this._companyProfileRepository.save(company);
  }
}

