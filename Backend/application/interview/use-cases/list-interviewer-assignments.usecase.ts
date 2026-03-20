import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IInterviewRepository } from '../ports/repository/IInterviewRepository.js';
import type { Interview } from '../../../domain/entities/Interview.js';

export interface IListInterviewerAssignmentsInput {
  interviewerUserId: string;
  search?: string;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
  acceptedOnly?: boolean;
}

export interface IListInterviewerAssignmentsUseCase {
  execute(input: IListInterviewerAssignmentsInput): Promise<{ data: Interview[]; total: number }>;
}

@injectable()
export class ListInterviewerAssignmentsUseCase implements IListInterviewerAssignmentsUseCase {
  constructor(
    @inject(TYPES.InterviewRepositoryPort) private readonly _repo: IInterviewRepository
  ) {}

  async execute(input: IListInterviewerAssignmentsInput): Promise<{ data: Interview[]; total: number }> {
    const { interviewerUserId, search, page, limit, sortOrder, acceptedOnly } = input;
    return this._repo.listByInterviewerUserId(interviewerUserId, {
      search,
      page,
      limit,
      sortOrder,
      acceptedOnly,
    });
  }
}
