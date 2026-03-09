import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IInterviewFeedbackRepository } from '../ports/repository/IInterviewFeedbackRepository.js';

export interface ICandidateInterviewHistoryItem {
  id: string;
  interviewId: string;
  companyName: string;
  interviewerName: string;
  feedback: string;
  totalScore: number;
  createdAt: string;
}

export interface IListMyInterviewFeedbacksUseCase {
  execute(input: { candidateUserId: string }): Promise<{ data: ICandidateInterviewHistoryItem[] }>;
}

@injectable()
export class ListMyInterviewFeedbacksUseCase implements IListMyInterviewFeedbacksUseCase {
  constructor(
    @inject(TYPES.InterviewFeedbackRepositoryPort)
    private readonly feedbackRepo: IInterviewFeedbackRepository
  ) {}

  async execute(input: { candidateUserId: string }): Promise<{ data: ICandidateInterviewHistoryItem[] }> {
    const feedbacks = await this.feedbackRepo.listByCandidateUserId(input.candidateUserId);

    
    const items: ICandidateInterviewHistoryItem[] = feedbacks.map((fb) => ({
      id: fb.id ?? fb.interviewId,
      interviewId: fb.interviewId,
      companyName: fb.companyName,
      interviewerName: fb.interviewerName,
      feedback: fb.feedback,
      totalScore: fb.totalScore,
      createdAt: fb.createdAt.toISOString(),
    }));

    return { data: items };
  }
}

