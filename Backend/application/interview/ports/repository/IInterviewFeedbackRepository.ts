import type { InterviewFeedback } from '../../../../domain/entities/InterviewFeedback.js';

export interface ListByCandidateUserIdOptions {
  search?: string;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface IInterviewFeedbackRepository {
  create(feedback: InterviewFeedback): Promise<InterviewFeedback>;
  findLatestByInterviewId(interviewId: string): Promise<InterviewFeedback | null>;
  listByCandidateUserId(
    candidateUserId: string,
    options?: ListByCandidateUserIdOptions
  ): Promise<{ data: InterviewFeedback[]; total: number }>;
}

