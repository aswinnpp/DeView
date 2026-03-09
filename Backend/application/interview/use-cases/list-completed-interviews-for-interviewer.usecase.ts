import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IInterviewRepository } from '../ports/repository/IInterviewRepository.js';
import type { Interview } from '../../../domain/interview/entities/Interview.js';

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

@injectable()
export class ListCompletedInterviewsForInterviewerUseCase
  implements IListCompletedInterviewsForInterviewerUseCase
{
  constructor(
    @inject(TYPES.InterviewRepositoryPort) private readonly repo: IInterviewRepository
  ) {}

  async execute(input: IListCompletedInterviewsForInterviewerInput): Promise<{ data: Interview[]; total: number }> {
    const { interviewerUserId, search, page, limit, sortOrder } = input;
    return this.repo.listCompletedByInterviewerUserId(interviewerUserId, {
      search,
      page,
      limit,
      sortOrder,
    });
  }
}

