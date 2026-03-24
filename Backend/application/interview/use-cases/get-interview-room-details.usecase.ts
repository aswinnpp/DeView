import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IInterviewRepository } from '../ports/repository/IInterviewRepository.js';
import type { Interview } from '../../../domain/entities/Interview.js';
import { AppError } from '../../../shared/errors/AppError.js';
import type {
  IGetInterviewRoomDetailsInputDTO,
  IGetInterviewRoomDetailsOutputDTO,
} from '../dtos/InterviewRoomDTO.js';
import type { IGetInterviewRoomDetailsUseCase } from '../ports/usecase/IGetInterviewRoomDetailsUseCase.js';

@injectable()
export class GetInterviewRoomDetailsUseCase implements IGetInterviewRoomDetailsUseCase {
  constructor(
    @inject(TYPES.InterviewRepositoryPort)
    private readonly _interviewRepository: IInterviewRepository
  ) {}

  async execute(input: IGetInterviewRoomDetailsInputDTO): Promise<IGetInterviewRoomDetailsOutputDTO> {
    const { interviewId, userId, role, companyId } = input;

    const interview = await this._interviewRepository.findById(interviewId);
    if (!interview) {
      throw AppError.notFound('Interview not found');
    }

    this.ensureAuthorized(interview, userId, role, companyId);
    if ((interview.interviewType ?? 'ONLINE') !== 'ONLINE') {
      throw AppError.badRequest('This interview type does not use an online room');
    }

    return {
      interviewId: interview.id ?? interviewId,
      roomName: interview.roomName,
      scheduledDate: interview.scheduledDate,
      scheduledTime: interview.scheduledTime,
      jobTitle: interview.jobTitle,
      companyName: interview.companyName,
      candidateName: interview.candidateName,
      interviewerName: interview.interviewerName,
    };
  }

  private ensureAuthorized(
    interview: Interview,
    userId: string,
    role: string,
    companyId?: string
  ): void {
    const isCandidate = interview.candidateUserId === userId;
    const isInterviewer = interview.interviewerUserId === userId;
    const isCompanySide =
      (role === 'company' || role === 'hr' || role === 'admin') &&
      companyId &&
      interview.companyId === companyId;

    if (!isCandidate && !isInterviewer && !isCompanySide) {
      throw AppError.forbidden('You are not allowed to join this interview');
    }
  }
}
