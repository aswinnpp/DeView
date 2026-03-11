import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IJobRepository } from '../ports/repository/IJobRepository.js';
import type { IUpdateJobUseCase } from '../ports/usecase/IUpdateJobUseCase.js';
import type { IUpdateJobDTO } from '../dtos/UpdateJobDTO.js';
import type { IApplicationRepository } from '../../application/ports/repository/IApplicationRepository.js';
import type { ICompanyProfileRepository } from '../../company/ports/repository/ICompanyProfileRepository.js';
import { AppError } from '../../../shared/errors/AppError.js';

@injectable()
export class UpdateJobUseCase implements IUpdateJobUseCase {
  constructor(
    @inject(TYPES.JobRepositoryPort) private readonly repo: IJobRepository,
    @inject(TYPES.ApplicationRepositoryPort)
    private readonly applicationRepo: IApplicationRepository,
    @inject(TYPES.CompanyProfileRepositoryPort)
    private readonly companyRepo: ICompanyProfileRepository,
  ) {}

  async execute(dto: IUpdateJobDTO) {
    const job = await this.repo.findById(dto.jobId);

    if (!job || job.companyId !== dto.companyId) {
      throw AppError.notFound('Job not found');
    }

    const existingApplications = await this.applicationRepo.listByJobId(
      dto.jobId,
      dto.companyId,
    );
    if (existingApplications.length > 0) {
      throw AppError.forbidden(
        'This job already has applications and can no longer be edited. You may close the job or create a new posting instead.',
      );
    }

    const company = await this.companyRepo.findById(dto.companyId);
    if (!company) {
      throw AppError.forbidden(
        'Company profile not found. Please contact support before editing jobs.',
      );
    }

    const now = new Date();
    company.refreshSubscriptions(now);
    await this.companyRepo.save(company);

    if (!company.activeSubscription) {
      throw AppError.forbidden(
        'Your subscription has expired or is missing. Please upgrade your plan to edit jobs.',
      );
    }

    job.updateFields(dto.data);
    await this.repo.save(job);

    return { job };
  }
}

