import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IInterviewRepository } from '../ports/repository/IInterviewRepository.js';
import type { Interview } from '../../../domain/interview/entities/Interview.js';

export interface IListCompletedInterviewsForInterviewerUseCase {
  execute(input: { interviewerUserId: string }): Promise<{ data: Interview[] }>;
}

@injectable()
export class ListCompletedInterviewsForInterviewerUseCase
  implements IListCompletedInterviewsForInterviewerUseCase
{
  constructor(
    @inject(TYPES.InterviewRepositoryPort) private readonly repo: IInterviewRepository
  ) {}

  async execute(input: { interviewerUserId: string }): Promise<{ data: Interview[] }> {
    const data = await this.repo.listCompletedByInterviewerUserId(input.interviewerUserId);
    return { data };
  }
}

