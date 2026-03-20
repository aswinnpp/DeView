import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IInterviewRepository } from '../ports/repository/IInterviewRepository.js';
import type { IApplicationRepository } from '../../job-application/ports/repository/IApplicationRepository.js';
import type { InterviewStatus } from '../../../domain/entities/Interview.js';
import { AppError } from '../../../shared/errors/AppError.js';

export interface IUpdateInterviewStatusInput {
  interviewId: string;
  interviewerUserId: string;
  status: InterviewStatus;
}

@injectable()
export class UpdateInterviewStatusUseCase {
  constructor(
    @inject(TYPES.InterviewRepositoryPort)
    private readonly _interviewRepository: IInterviewRepository,
    @inject(TYPES.ApplicationRepositoryPort)
    private readonly _applicationRepository: IApplicationRepository
  ) {}

  async execute(input: IUpdateInterviewStatusInput): Promise<void> {
    const { interviewId, interviewerUserId, status } = input;

    const interview = await this._interviewRepository.findById(interviewId);
    if (!interview) {
      throw AppError.notFound('Interview not found');
    }

    if (interview.interviewerUserId !== interviewerUserId) {
      throw AppError.forbidden('Only the assigned interviewer can update interview status');
    }

    const updated = await this._interviewRepository.updateStatus(interviewId, status);
    if (!updated) {
      throw AppError.internal('Failed to update interview status');
    }

 
    if (status === 'COMPLETED') {
      await this._applicationRepository.addCompletedRound({
        applicationId: interview.applicationId,
        jobId: interview.jobId,
        companyId: interview.companyId,
        round: interview.round,
      });
      await this._applicationRepository.updateStatus({
        applicationId: interview.applicationId,
        jobId: interview.jobId,
        companyId: interview.companyId,
        status: 'COMPLETED',
      });
    }
  }
}
