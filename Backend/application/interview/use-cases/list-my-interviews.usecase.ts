import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IInterviewRepository } from '../ports/repository/IInterviewRepository.js';
import type { Interview } from '../../../domain/interview/entities/Interview.js';

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

@injectable()
export class ListMyInterviewsUseCase implements IListMyInterviewsUseCase {
  constructor(
    @inject(TYPES.InterviewRepositoryPort) private readonly repo: IInterviewRepository
  ) {}

  async execute(input: IListMyInterviewsInput): Promise<{ data: Interview[]; total: number }> {
    const { candidateUserId, search, page, limit, sortOrder } = input;
    return this.repo.listByCandidateUserId(candidateUserId, { search, page, limit, sortOrder });
  }
}

