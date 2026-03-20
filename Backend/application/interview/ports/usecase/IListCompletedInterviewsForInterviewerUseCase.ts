import type { Interview } from '../../../../domain/entities/Interview.js';

export interface IListCompletedInterviewsForInterviewerInput {
  interviewerUserId: string;
  search?: string;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface IListCompletedInterviewsForInterviewerUseCase {
  execute(input: IListCompletedInterviewsForInterviewerInput): Promise<{ data: Interview[]; total: number }>;
}

