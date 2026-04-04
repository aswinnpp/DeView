import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IApplicationRepository } from '../ports/repository/IApplicationRepository.js';
import type { IInterviewRepository } from '../../interview/ports/repository/IInterviewRepository.js';
import type { ApplicationView } from '../dtos/ApplicationView.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { ApplicationMapper } from '../mappers/ApplicationMapper.js';

export interface IDeclineRescheduleRequestInput {
  companyId: string;
  jobId: string;
  applicationId: string;
}

export interface IDeclineRescheduleRequestUseCase {
  execute(input: IDeclineRescheduleRequestInput): Promise<{ application: ApplicationView }>;
}

@injectable()
export class DeclineRescheduleRequestUseCase implements IDeclineRescheduleRequestUseCase {
  constructor(
    @inject(TYPES.ApplicationRepositoryPort)
    private readonly _applicationRepository: IApplicationRepository,
    @inject(TYPES.InterviewRepositoryPort)
    private readonly _interviewRepository: IInterviewRepository
  ) {}

  async execute(input: IDeclineRescheduleRequestInput): Promise<{ application: ApplicationView }> {
    const { companyId, jobId, applicationId } = input;

    const updated = await this._applicationRepository.updateStatus({
      applicationId,
      jobId,
      companyId,
      status: 'INTERVIEW_SCHEDULED',
    });

    if (!updated) {
      throw AppError.notFound('Application not found');
    }

    const existing = await this._interviewRepository.findActiveByApplicationId(applicationId);
    if (existing?.id) {
      await this._interviewRepository.declineCandidateRejection(existing.id);
    }

    return { application: ApplicationMapper.toView(updated) };
  }
}
