import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IInterviewRepository } from '../ports/repository/IInterviewRepository.js';
import type { IInterviewFeedbackRepository } from '../ports/repository/IInterviewFeedbackRepository.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { InterviewFeedback } from '../../../domain/interview/entities/InterviewFeedback.js';

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
    @inject(TYPES.InterviewRepositoryPort) private readonly interviewRepo: IInterviewRepository,
    @inject(TYPES.InterviewFeedbackRepositoryPort)
    private readonly feedbackRepo: IInterviewFeedbackRepository
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

    const interview = await this.interviewRepo.findById(interviewId);
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
      interviewerUserId,
      interview.interviewerName,
      feedback.trim(),
      totalScore,
      now,
      now
    );

    await this.feedbackRepo.create(feedbackEntity);

    return { success: true };
  }
}

