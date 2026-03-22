import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IInterviewRepository } from '../ports/repository/IInterviewRepository.js';
import type { IAcceptInterviewAssignmentUseCase } from '../ports/usecase/IAcceptInterviewAssignmentUseCase.js';
import type {
  IAcceptInterviewAssignmentInputDTO,
  IAcceptInterviewAssignmentOutputDTO,
} from '../dtos/InterviewCommandDTO.js';

@injectable()
export class AcceptInterviewAssignmentUseCase implements IAcceptInterviewAssignmentUseCase {
  constructor(
    @inject(TYPES.InterviewRepositoryPort) private readonly _repo: IInterviewRepository
  ) {}

  async execute(input: IAcceptInterviewAssignmentInputDTO): Promise<IAcceptInterviewAssignmentOutputDTO> {
    const interview = await this._repo.findById(input.interviewId);
    if (!interview || interview.interviewerUserId !== input.interviewerUserId) {
      return { data: null };
    }
    const updated = await this._repo.setInterviewerAccepted(input.interviewId, true);
    return { data: updated };
  }
}
