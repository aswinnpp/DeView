import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IApplicationRepository } from '../ports/repository/IApplicationRepository.js';
import type { IInterviewRepository } from '../../interview/ports/repository/IInterviewRepository.js';
import type { ICompanyProfileRepository } from '../../company/ports/repository/ICompanyProfileRepository.js';
import type { IJobRepository } from '../../job/ports/repository/IJobRepository.js';
import type { ISubscriptionRepository } from '../../admin/ports/repository/ISubscriptionRepository.js';
import type { Application } from '../../../domain/application/entities/Application.js';
import { Interview } from '../../../domain/interview/entities/Interview.js';
import { AppError } from '../../../shared/errors/AppError.js';

export interface IScheduleInterviewInput {
  companyId: string;
  jobId: string;
  applicationId: string;
  round: string;
  interviewerUserId: string;
  interviewerName: string;
  interviewerEmail?: string;
  scheduledDate: string;
  scheduledTime: string;
}

export interface IScheduleInterviewUseCase {
  execute(input: IScheduleInterviewInput): Promise<{ application: Application }>;
}

@injectable()
export class ScheduleInterviewUseCase implements IScheduleInterviewUseCase {
  constructor(
    @inject(TYPES.ApplicationRepositoryPort)
    private readonly applicationRepository: IApplicationRepository,
    @inject(TYPES.InterviewRepositoryPort)
    private readonly interviewRepository: IInterviewRepository,
    @inject(TYPES.CompanyProfileRepositoryPort)
    private readonly companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.JobRepositoryPort)
    private readonly jobRepository: IJobRepository,
    @inject(TYPES.SubscriptionRepositoryPort)
    private readonly subscriptionRepository: ISubscriptionRepository
  ) {}

  async execute(input: IScheduleInterviewInput): Promise<{ application: Application }> {
    const {
      companyId,
      jobId,
      applicationId,
      round,
      interviewerUserId,
      interviewerName,
      interviewerEmail,
      scheduledDate,
      scheduledTime,
    } = input;

    const trimmedRound = String(round ?? '').trim();
    const trimmedInterviewerUserId = String(interviewerUserId ?? '').trim();
    const trimmedInterviewerName = String(interviewerName ?? '').trim();
    const trimmedInterviewerEmail = interviewerEmail ? String(interviewerEmail).trim() : undefined;
    const trimmedDate = String(scheduledDate ?? '').trim();
    const trimmedTime = String(scheduledTime ?? '').trim();

    if (!companyId) {
      throw AppError.badRequest('companyId is required to schedule an interview');
    }

    const now = new Date();

    // ── Guard: company must have an active subscription with interview capacity ──
    const company = await this.companyProfileRepository.findById(companyId);
    if (!company) {
      throw AppError.forbidden(
        'Company profile not found. Please complete your company profile before scheduling interviews.',
      );
    }

    company.refreshSubscriptions(now);
    await this.companyProfileRepository.save(company);

    const activeSub = company.activeSubscription;
    if (!activeSub) {
      throw AppError.forbidden(
        'Your subscription has expired or is missing. Please upgrade your plan to schedule interviews.',
      );
    }

    // Use embedded limits from company profile (admin plan edits do not affect subscribers).
    // Fallback to plan table for legacy records missing embedded limits.
    let interviewLimit = activeSub.interviewLimit;
    let interviewUnlimited = activeSub.interviewUnlimited;
    if (interviewLimit === undefined || interviewUnlimited === undefined) {
      const plan = await this.subscriptionRepository.findById(activeSub.planId);
      if (!plan) {
        throw AppError.forbidden(
          'Unable to resolve your subscription plan. Please contact support or upgrade your plan.',
        );
      }
      interviewLimit = plan.interviewLimit;
      interviewUnlimited = plan.interviewUnlimited;
      // Backfill embedded limits for legacy records
      activeSub.interviewLimit = plan.interviewLimit;
      activeSub.interviewUnlimited = plan.interviewUnlimited;
      activeSub.jobPostLimit = plan.jobPostLimit;
      activeSub.jobUnlimited = plan.jobUnlimited;
      await this.companyProfileRepository.save(company);
    }

    const existing = await this.interviewRepository.findActiveByApplicationId(applicationId);

    // Only enforce interview count limit when creating a brand new interview record.
    if (!existing && !interviewUnlimited) {
      if (!Number.isFinite(interviewLimit) || (interviewLimit ?? 0) <= 0) {
        throw AppError.forbidden(
          'Your current plan does not allow interview scheduling. Please upgrade your plan.',
        );
      }

      const allCompanyInterviews = await this.interviewRepository.listByCompanyId(companyId);
      const totalInterviewsCount = allCompanyInterviews.length;

      if (totalInterviewsCount >= (interviewLimit ?? 0)) {
        // Frontend can map this specific message to a "limit reached" modal.
        throw AppError.forbidden(
          'You have reached the interview scheduling limit for your current plan. Please upgrade your plan to schedule more interviews.',
        );
      }
    }

    const updated = await this.applicationRepository.scheduleInterview({
      applicationId,
      jobId,
      companyId,
      interviewDetails: {
        round: trimmedRound,
        interviewer: trimmedInterviewerName,
        interviewerEmail: trimmedInterviewerEmail,
        scheduledDate: trimmedDate,
        scheduledTime: trimmedTime,
      },
    });

    if (!updated) {
      throw AppError.notFound('Application not found');
    }

    const companyProfile = companyId ? await this.companyProfileRepository.findById(companyId) : null;
    const companyName = companyProfile?.companyName ?? '';
    const job = await this.jobRepository.findById(jobId);
    const jobTitle = job?.title ?? '';

    if (existing?.id) {
      const keepAccepted =
        existing.interviewerUserId === trimmedInterviewerUserId ? existing.interviewerAccepted : false;
      await this.interviewRepository.rescheduleFromCompany(existing.id, {
        scheduledDate: trimmedDate,
        scheduledTime: trimmedTime,
        interviewerUserId: trimmedInterviewerUserId,
        interviewerName: trimmedInterviewerName,
        round: trimmedRound,
      });
      await this.interviewRepository.setInterviewerAccepted(existing.id, keepAccepted);
    } else {
      const roomName = `deview-interview-${applicationId}-${Date.now()}`;
      await this.interviewRepository.create(
        new Interview(
          null,
          companyId,
          companyName,
          jobId,
          jobTitle,
          roomName,
          applicationId,
          updated.candidateUserId,
          updated.fullName,
          trimmedInterviewerUserId,
          trimmedInterviewerName,
          trimmedRound,
          trimmedDate,
          trimmedTime,
          'SCHEDULED',
          false,
          undefined
        )
      );
    }

    return { application: updated };
  }
}
