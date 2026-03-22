import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IInterviewRepository } from '../ports/repository/IInterviewRepository.js';
import type { IRejectInterviewAssignmentUseCase } from '../ports/usecase/IRejectInterviewAssignmentUseCase.js';
import type {
  IRejectInterviewAssignmentInputDTO,
  IRejectInterviewAssignmentOutputDTO,
} from '../dtos/InterviewCommandDTO.js';

@injectable()
export class RejectInterviewAssignmentUseCase implements IRejectInterviewAssignmentUseCase {
  constructor(
    @inject(TYPES.InterviewRepositoryPort) private readonly _repo: IInterviewRepository
  ) {}

  async execute(input: IRejectInterviewAssignmentInputDTO): Promise<IRejectInterviewAssignmentOutputDTO> {
    const interview = await this._repo.findById(input.interviewId);
    if (!interview || interview.interviewerUserId !== input.interviewerUserId) {
      return { data: null };
    }
    const updated = await this._repo.setInterviewerAccepted(input.interviewId, false, input.reason.trim());
    return { data: updated };
  }
}
