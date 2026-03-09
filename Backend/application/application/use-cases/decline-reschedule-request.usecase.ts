import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IApplicationRepository } from '../ports/repository/IApplicationRepository.js';
import type { IInterviewRepository } from '../../interview/ports/repository/IInterviewRepository.js';
import type { Application } from '../../../domain/application/entities/Application.js';
import { AppError } from '../../../shared/errors/AppError.js';

export interface IDeclineRescheduleRequestInput {
  companyId: string;
  jobId: string;
  applicationId: string;
}

export interface IDeclineRescheduleRequestUseCase {
  execute(input: IDeclineRescheduleRequestInput): Promise<{ application: Application }>;
}

@injectable()
export class DeclineRescheduleRequestUseCase implements IDeclineRescheduleRequestUseCase {
  constructor(
    @inject(TYPES.ApplicationRepositoryPort)
    private readonly applicationRepository: IApplicationRepository,
    @inject(TYPES.InterviewRepositoryPort)
    private readonly interviewRepository: IInterviewRepository
  ) {}

  async execute(input: IDeclineRescheduleRequestInput): Promise<{ application: Application }> {
    const { companyId, jobId, applicationId } = input;

    const updated = await this.applicationRepository.updateStatus({
      applicationId,
      jobId,
      companyId,
      status: 'INTERVIEW_SCHEDULED',
    });

    if (!updated) {
      throw AppError.notFound('Application not found');
    }

    const existing = await this.interviewRepository.findActiveByApplicationId(applicationId);
    if (existing?.id) {
      await this.interviewRepository.declineCandidateRejection(existing.id);
    }

    return { application: updated };
  }
}
