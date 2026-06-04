import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IApplicationRepository } from '../ports/repository/IApplicationRepository.js';
import type { IInterviewRepository } from '../../interview/ports/repository/IInterviewRepository.js';
import type { IInterviewFeedbackRepository } from '../../interview/ports/repository/IInterviewFeedbackRepository.js';
import { AppError } from '../../../shared/errors/AppError.js';

export interface IGetLatestInterviewerFeedbackInput {
  companyId: string;
  jobId: string;
  applicationId: string;
}

export interface IGetLatestInterviewerFeedbackUseCase {
  execute(input: IGetLatestInterviewerFeedbackInput): Promise<{
    data: {
      interviewId: string;
      interviewerName: string;
      jobId: string;
      round: string;
      totalScore: number;
      feedback: string;
      createdAt: string;
    };
  }>;
}

@injectable()
export class GetLatestInterviewerFeedbackUseCase implements IGetLatestInterviewerFeedbackUseCase {
  constructor(
    @inject(TYPES.ApplicationRepositoryPort)
    private readonly _applicationRepository: IApplicationRepository,
    @inject(TYPES.InterviewRepositoryPort)
    private readonly _interviewRepository: IInterviewRepository,
    @inject(TYPES.InterviewFeedbackRepositoryPort)
    private readonly _interviewFeedbackRepository: IInterviewFeedbackRepository
  ) {}

  async execute(input: IGetLatestInterviewerFeedbackInput) {
    const { companyId, jobId, applicationId } = input;

    const app = await this._applicationRepository.findByIdAndJobId(applicationId, jobId, companyId);
    if (!app) throw AppError.notFound('Application not found');

    const lastCompleted = await this._interviewRepository.findLatestCompletedByApplicationId(applicationId);
    if (!lastCompleted) throw AppError.notFound('No completed interview found');
    if (!lastCompleted.id) throw AppError.notFound('Interview not found');

    const fb = await this._interviewFeedbackRepository.findLatestByInterviewId(lastCompleted.id);
    if (!fb) throw AppError.notFound('Interviewer feedback not submitted yet');

    return {
      data: {
        interviewId: fb.interviewId,
        interviewerName: fb.interviewerName,
        jobId: fb.jobId,
        round: fb.round,
        totalScore: fb.totalScore,
        feedback: fb.feedback,
        createdAt: fb.createdAt.toISOString(),
      },
    };
  }
}

