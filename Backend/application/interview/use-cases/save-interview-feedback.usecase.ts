import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IInterviewRepository } from '../ports/repository/IInterviewRepository.js';
import type { IInterviewFeedbackRepository } from '../ports/repository/IInterviewFeedbackRepository.js';
import type { IApplicationRepository } from '../../job-application/ports/repository/IApplicationRepository.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { InterviewFeedback } from '../../../domain/entities/InterviewFeedback.js';

export interface ISaveInterviewFeedbackUseCase {
  execute(input: {
    interviewId: string;
    interviewerUserId: string;
    totalScore: number;
    feedback: string;
  }): Promise<{ success: boolean }>;
}

@injectable()
export class SaveInterviewFeedbackUseCase implements ISaveInterviewFeedbackUseCase {
  constructor(
    @inject(TYPES.InterviewRepositoryPort) private readonly _interviewRepo: IInterviewRepository,
    @inject(TYPES.InterviewFeedbackRepositoryPort)
    private readonly _feedbackRepo: IInterviewFeedbackRepository,
    @inject(TYPES.ApplicationRepositoryPort) private readonly _applicationRepo: IApplicationRepository
  ) {}

  async execute(input: {
    interviewId: string;
    interviewerUserId: string;
    totalScore: number;
    feedback: string;
  }): Promise<{ success: boolean }> {
    const { interviewId, interviewerUserId, totalScore, feedback } = input;

    if (!feedback.trim()) {
      throw AppError.badRequest('Feedback is required');
    }

    if (!Number.isFinite(totalScore) || totalScore < 1 || totalScore > 5) {
      throw AppError.badRequest('Total score must be between 1 and 5');
    }

    const interview = await this._interviewRepo.findById(interviewId);
    if (!interview) {
      throw AppError.notFound('Interview not found');
    }
    if (interview.interviewerUserId !== interviewerUserId) {
      throw AppError.forbidden('You are not allowed to submit feedback for this interview');
    }
    if (interview.status !== 'COMPLETED') {
      throw AppError.badRequest('Feedback can only be submitted for completed interviews');
    }

    const now = new Date();
    const feedbackEntity = new InterviewFeedback(
      null,
      interview.id ?? interviewId,
      interview.candidateUserId,
      interview.companyId,
      interview.companyName,
      interview.jobId,
      interviewerUserId,
      interview.interviewerName,
      interview.round,
      feedback.trim(),
      totalScore,
      now,
      now
    );

    await this._feedbackRepo.create(feedbackEntity);
    await this._interviewRepo.setFeedbackSubmitted(interview.id ?? interviewId, true);

    await this._applicationRepo.updateInterviewFeedback({
      applicationId: interview.applicationId,
      jobId: interview.jobId,
      companyId: interview.companyId,
      round: interview.round,
      feedback: feedback.trim(),
      totalScore,
    });

    return { success: true };
  }
}

