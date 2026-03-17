import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types';
import { ISubscriptionUseCase } from '../ports/usecase/ISubscription';
import { ISubscriptionRepository } from '../../admin/ports/repository/ISubscriptionRepository';
import { AppError } from '../../../shared/errors/AppError';
import { ICompanyProfileRepository } from '../../company/ports/repository/ICompanyProfileRepository';
import { IJobRepository } from '../ports/repository/IJobRepository';
@injectable()
export class SubscriptionUseCase implements ISubscriptionUseCase {
  constructor(
    @inject(TYPES.SubscriptionRepositoryPort) private readonly _subscriptionRepository: ISubscriptionRepository,
    @inject(TYPES.CompanyProfileRepositoryPort) private readonly _companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.JobRepositoryPort) private readonly _jobRepository: IJobRepository,
  ) {}

  async execute(ctx: { companyId: string }): Promise<void> {
    
  

  const company = await this._companyProfileRepository.findById(ctx.companyId);
  if (!company) {
    throw AppError.notFound('Company not found');
  }

  const now = new Date();
 

  company.refreshSubscriptions(now);
    await this._companyProfileRepository.save(company);

    const activeSub = company.activeSubscription;

    if (!activeSub) {
      throw AppError.forbidden('Your subscription has expired or is missing. Please upgrade your plan to post jobs.');
    }

    
    let jobPostLimit = activeSub.jobPostLimit;
    let jobUnlimited = activeSub.jobUnlimited;
    if (jobPostLimit === undefined || jobUnlimited === undefined) {
      const plan = await this._subscriptionRepository.findById(activeSub.planId);
      if (!plan) {
        throw AppError.forbidden('Unable to resolve your subscription plan. Please contact support or upgrade your plan.');
      }
      jobPostLimit = plan.jobPostLimit;
      jobUnlimited = plan.jobUnlimited;
      activeSub.interviewLimit = plan.interviewLimit;
      activeSub.interviewUnlimited = plan.interviewUnlimited;
      activeSub.jobPostLimit = plan.jobPostLimit;
      activeSub.jobUnlimited = plan.jobUnlimited;
      await this._companyProfileRepository.save(company);
    }

    if (!jobUnlimited) {
      if (!Number.isFinite(jobPostLimit) || (jobPostLimit ?? 0) <= 0) {
        throw AppError.forbidden('Your current plan does not allow job postings. Please upgrade your plan.');
      }

      const existingJobs = await this._jobRepository.listByCompanyId(ctx.companyId);
      const activeJobsCount = existingJobs.length;

      if (activeJobsCount >= (jobPostLimit ?? 0)) {
        throw AppError.forbidden(
          'You have reached the job posting limit for your current plan. Please upgrade your plan to post more jobs.',
        );
      }
    }
}
}