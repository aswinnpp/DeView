import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IInterviewRepository } from '../../interview/ports/repository/IInterviewRepository.js';
import type { ICompanyProfileRepository } from '../../company/ports/repository/ICompanyProfileRepository.js';
import type { ISubscriptionRepository } from '../../admin/ports/repository/ISubscriptionRepository.js';
import { AppError } from '../../../shared/errors/AppError.js';
import type { IPrecheckScheduleInterviewUseCase } from '../ports/usecase/IPrecheckScheduleInterviewUseCase.js';
import type {
  IPrecheckScheduleInterviewInputDTO,
  IPrecheckScheduleInterviewOutputDTO,
} from '../dtos/PrecheckScheduleInterviewDTO.js';

@injectable()
export class PrecheckScheduleInterviewUseCase implements IPrecheckScheduleInterviewUseCase {
  constructor(
    @inject(TYPES.InterviewRepositoryPort)
    private readonly _interviewRepository: IInterviewRepository,
    @inject(TYPES.CompanyProfileRepositoryPort)
    private readonly _companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.SubscriptionRepositoryPort)
    private readonly _subscriptionRepository: ISubscriptionRepository
  ) {}

  async execute(input: IPrecheckScheduleInterviewInputDTO): Promise<IPrecheckScheduleInterviewOutputDTO> {
    const companyId = String(input.companyId ?? '').trim();
    const jobId = String(input.jobId ?? '').trim();
    const applicationId = String(input.applicationId ?? '').trim();

    if (!companyId) throw AppError.badRequest('companyId is required');
    if (!jobId) throw AppError.badRequest('jobId is required');
    if (!applicationId) throw AppError.badRequest('applicationId is required');

    const now = new Date();

    const company = await this._companyProfileRepository.findById(companyId);
    if (!company) {
      throw AppError.forbidden(
        'Company profile not found. Please complete your company profile before scheduling interviews.'
      );
    }

    company.refreshSubscriptions(now);
    await this._companyProfileRepository.save(company);

    const activeSub = company.activeSubscription;
    if (!activeSub) {
      throw AppError.forbidden(
        'Your subscription has expired or is missing. Please upgrade your plan to schedule interviews.'
      );
    }

    let interviewLimit = activeSub.interviewLimit;
    let interviewUnlimited = activeSub.interviewUnlimited;
    if (interviewLimit === undefined || interviewUnlimited === undefined) {
      const plan = await this._subscriptionRepository.findById(activeSub.planId);
      if (!plan) {
        throw AppError.forbidden(
          'Unable to resolve your subscription plan. Please contact support or upgrade your plan.'
        );
      }
      interviewLimit = plan.interviewLimit;
      interviewUnlimited = plan.interviewUnlimited;

      activeSub.interviewLimit = plan.interviewLimit;
      activeSub.interviewUnlimited = plan.interviewUnlimited;
      activeSub.jobPostLimit = plan.jobPostLimit;
      activeSub.jobUnlimited = plan.jobUnlimited;
      await this._companyProfileRepository.save(company);
    }

    const existing = await this._interviewRepository.findActiveByApplicationId(applicationId);

    if (!existing) {
      const lastCompleted = await this._interviewRepository.findLatestCompletedByApplicationId(applicationId);
      if (lastCompleted && !lastCompleted.feedbackSubmitted) {
        throw AppError.forbidden('Interviewer feedback PENDING');
      }
    }

    if (!existing && !interviewUnlimited) {
      if (!Number.isFinite(interviewLimit) || (interviewLimit ?? 0) <= 0) {
        throw AppError.forbidden(
          'Your current plan does not allow interview scheduling. Please upgrade your plan.'
        );
      }

      const allCompanyInterviews = await this._interviewRepository.listByCompanyId(companyId);
      const totalInterviewsCount = allCompanyInterviews.length;

      if (totalInterviewsCount >= (interviewLimit ?? 0)) {
        throw AppError.forbidden(
          'You have reached the interview scheduling limit for your current plan. Please upgrade your plan to schedule more interviews.'
        );
      }
    }


    return { ok: true };
  }
}

