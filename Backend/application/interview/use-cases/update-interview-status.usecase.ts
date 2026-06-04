import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IInterviewRepository } from '../ports/repository/IInterviewRepository.js';
import type { IApplicationRepository } from '../../job-application/ports/repository/IApplicationRepository.js';
import type { IJobRepository } from '../../job/ports/repository/IJobRepository.js';
import { AppError } from '../../../shared/errors/AppError.js';
import type { IUpdateInterviewStatusUseCase } from '../ports/usecase/IUpdateInterviewStatusUseCase.js';
import type { IUpdateInterviewStatusInputDTO } from '../dtos/InterviewCommandDTO.js';

@injectable()
export class UpdateInterviewStatusUseCase implements IUpdateInterviewStatusUseCase {
  constructor(
    @inject(TYPES.InterviewRepositoryPort)
    private readonly _interviewRepository: IInterviewRepository,
    @inject(TYPES.ApplicationRepositoryPort)
    private readonly _applicationRepository: IApplicationRepository,
    @inject(TYPES.JobRepositoryPort)
    private readonly _jobRepository: IJobRepository
  ) {}

  async execute(input: IUpdateInterviewStatusInputDTO): Promise<void> {
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
      const appAfter = await this._applicationRepository.addCompletedRound({
        applicationId: interview.applicationId,
        jobId: interview.jobId,
        companyId: interview.companyId,
        round: interview.round,
      });

      const job = await this._jobRepository.findById(interview.jobId);
      const jobRounds =
        job?.interviewRounds && job.interviewRounds.length > 0
          ? job.interviewRounds
          : ['HR Screening'];

      const completed = new Set(appAfter?.completedRounds ?? []);
      const allRoundsDone = jobRounds.every((r) => completed.has(r));

      await this._applicationRepository.updateStatus({
        applicationId: interview.applicationId,
        jobId: interview.jobId,
        companyId: interview.companyId,
        status: allRoundsDone ? 'COMPLETED' : 'INTERVIEW_COMPLETE',
      });
    }
  }
}
