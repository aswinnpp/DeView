import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types';
import type { ICompanyProfileRepository } from '../../company/ports/repository/ICompanyProfileRepository';
import type { IInterviewRepository } from '../../interview/ports/repository/IInterviewRepository';
import type { IApplicationRepository } from '../../job-application/ports/repository/IApplicationRepository';
import type { IGetLandingStatsUseCase } from '../ports/usecase/IGetLandingStatsUseCase';

@injectable()
export class GetLandingStatsUseCase implements IGetLandingStatsUseCase {
  constructor(
    @inject(TYPES.CompanyProfileRepositoryPort) private readonly _companyRepo: ICompanyProfileRepository,
    @inject(TYPES.InterviewRepositoryPort) private readonly _interviewRepo: IInterviewRepository,
    @inject(TYPES.ApplicationRepositoryPort) private readonly _applicationRepo: IApplicationRepository,
  ) {}

  async execute() {
    // Use a small limit to avoid loading all approved companies into memory.
    const { total: companies } = await this._companyRepo.findApproved({ page: 1, limit: 1 });
    const interviewsConducted = await this._interviewRepo.countByStatus();
    const developersHired = await this._applicationRepo.countByStatus('HIRED');

    return { companies, interviewsConducted, developersHired };
  }
}

