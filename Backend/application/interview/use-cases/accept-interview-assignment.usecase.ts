import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IInterviewRepository } from '../ports/repository/IInterviewRepository.js';
import type { Interview } from '../../../domain/interview/entities/Interview.js';

export interface IAcceptInterviewAssignmentUseCase {
  execute(input: { interviewId: string; interviewerUserId: string }): Promise<{ data: Interview | null }>;
}

@injectable()
export class AcceptInterviewAssignmentUseCase implements IAcceptInterviewAssignmentUseCase {
  constructor(
    @inject(TYPES.InterviewRepositoryPort) private readonly _repo: IInterviewRepository
  ) {}

  async execute(input: { interviewId: string; interviewerUserId: string }): Promise<{ data: Interview | null }> {
    const interview = await this._repo.findById(input.interviewId);
    if (!interview || interview.interviewerUserId !== input.interviewerUserId) {
      return { data: null };
    }
    const updated = await this._repo.setInterviewerAccepted(input.interviewId, true);
    return { data: updated };
  }
}
