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

export interface IListMyInterviewFeedbacksInput {
  candidateUserId: string;
  search?: string;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface IListMyInterviewFeedbacksUseCase {
  execute(input: IListMyInterviewFeedbacksInput): Promise<{ data: ICandidateInterviewHistoryItem[]; total: number }>;
}

@injectable()
export class ListMyInterviewFeedbacksUseCase implements IListMyInterviewFeedbacksUseCase {
  constructor(
    @inject(TYPES.InterviewFeedbackRepositoryPort)
    private readonly _feedbackRepo: IInterviewFeedbackRepository
  ) {}

  async execute(input: IListMyInterviewFeedbacksInput): Promise<{
    data: ICandidateInterviewHistoryItem[];
    total: number;
  }> {
    const { candidateUserId, search, page, limit, sortOrder } = input;
    const { data: feedbacks, total } = await this._feedbackRepo.listByCandidateUserId(candidateUserId, {
      search,
      page,
      limit,
      sortOrder,
    });

    const items: ICandidateInterviewHistoryItem[] = feedbacks.map((fb) => ({
      id: fb.id ?? fb.interviewId,
      interviewId: fb.interviewId,
      companyName: fb.companyName,
      interviewerName: fb.interviewerName,
      feedback: fb.feedback,
      totalScore: fb.totalScore,
      createdAt: fb.createdAt.toISOString(),
    }));

    return { data: items, total };
  }
}

