import type { Interview } from '../../../../domain/entities/Interview.js';

export interface IListMyInterviewsInput {
  candidateUserId: string;
  search?: string;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface IListMyInterviewsUseCase {
  execute(input: IListMyInterviewsInput): Promise<{ data: Interview[]; total: number }>;
}

