import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IInterviewRepository } from '../ports/repository/IInterviewRepository.js';
import type { Interview } from '../../../domain/interview/entities/Interview.js';

export interface IListMyInterviewsUseCase {
  execute(input: { candidateUserId: string }): Promise<{ data: Interview[] }>;
}

@injectable()
export class ListMyInterviewsUseCase implements IListMyInterviewsUseCase {
  constructor(
    @inject(TYPES.InterviewRepositoryPort) private readonly repo: IInterviewRepository
  ) {}

  async execute(input: { candidateUserId: string }): Promise<{ data: Interview[] }> {
    const data = await this.repo.listByCandidateUserId(input.candidateUserId);
    return { data };
  }
}

