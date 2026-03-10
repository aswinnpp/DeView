import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IJobRepository } from '../ports/repository/IJobRepository.js';
import type { ICreateJobDTO } from '../dtos/CreateJobDTO.js';
import type { ICreateJobUseCase } from '../ports/usecase/ICreateJobUseCase.js';
import type { ICompanyProfileRepository } from '../../company/ports/repository/ICompanyProfileRepository.js';
import type { ISubscriptionRepository } from '../../admin/ports/repository/ISubscriptionRepository.js';
import { Job } from '../../../domain/job/entities/Job.js';
import { AppError } from '../../../shared/errors/AppError.js';


@injectable()
export class CreateJobUseCase implements ICreateJobUseCase {
  constructor(
    @inject(TYPES.JobRepositoryPort) private readonly repo: IJobRepository,
    @inject(TYPES.CompanyProfileRepositoryPort) private readonly companyRepo: ICompanyProfileRepository,
    @inject(TYPES.SubscriptionRepositoryPort) private readonly subscriptionRepo: ISubscriptionRepository,
  ) {}

  async execute(dto: ICreateJobDTO) {
    const now = new Date();

    // ── Guard: company must have an active (non‑expired) subscription plan ──
    const company = await this.companyRepo.findById(dto.companyId);

    if (!company) {
      throw AppError.forbidden('Company profile not found. Please complete your company profile before posting jobs.');
    }

    // Refresh subscription state (handles expiry & pending promotions)
    company.refreshSubscriptions(now);
    await this.companyRepo.save(company);

    const activeSub = company.activeSubscription;

    if (!activeSub) {
      throw AppError.forbidden('Your subscription has expired or is missing. Please upgrade your plan to post jobs.');
    }

    // Use embedded limits from company profile (admin plan edits do not affect subscribers).
    // Fallback to plan table for legacy records missing embedded limits.
    let jobPostLimit = activeSub.jobPostLimit;
    let jobUnlimited = activeSub.jobUnlimited;
    if (jobPostLimit === undefined || jobUnlimited === undefined) {
      const plan = await this.subscriptionRepo.findById(activeSub.planId);
      if (!plan) {
        throw AppError.forbidden('Unable to resolve your subscription plan. Please contact support or upgrade your plan.');
      }
      jobPostLimit = plan.jobPostLimit;
      jobUnlimited = plan.jobUnlimited;
      // Backfill embedded limits for legacy records
      activeSub.interviewLimit = plan.interviewLimit;
      activeSub.interviewUnlimited = plan.interviewUnlimited;
      activeSub.jobPostLimit = plan.jobPostLimit;
      activeSub.jobUnlimited = plan.jobUnlimited;
      await this.companyRepo.save(company);
    }

    if (!jobUnlimited) {
      if (!Number.isFinite(jobPostLimit) || (jobPostLimit ?? 0) <= 0) {
        throw AppError.forbidden('Your current plan does not allow job postings. Please upgrade your plan.');
      }

      // Count current active job postings (OPEN) for this company
      const existingJobs = await this.repo.listByCompanyId(dto.companyId);
      const activeJobsCount = existingJobs.length;

      if (activeJobsCount >= (jobPostLimit ?? 0)) {
        throw AppError.forbidden(
          'You have reached the job posting limit for your current plan. Please upgrade your plan to post more jobs.',
        );
      }
    }

    const job = new Job(
      null,
      dto.companyId,
      dto.title,
      dto.department,
      dto.location,
      dto.jobType,
      dto.workMode,
      dto.experienceLevel,
      dto.minExperience,
      dto.maxExperience,
      dto.salary,
      dto.salaryNonDisclosure ?? false,
      dto.skills,
      dto.qualifications,
      dto.responsibilities,
      dto.benefits,
      dto.description,
      dto.applicationDeadline,
      typeof dto.numberOfPositions === 'number'
        ? dto.numberOfPositions
        : Number(dto.numberOfPositions ?? 1),
      dto.interviewRounds,
      dto.status ?? 'OPEN',
      [],
      now,
      now,
    );

    await this.repo.save(job);

    return { job };
  }
}

