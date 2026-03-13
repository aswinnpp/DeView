import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IInterviewRepository } from '../ports/repository/IInterviewRepository.js';
import type { Interview } from '../../../domain/interview/entities/Interview.js';
import { AppError } from '../../../shared/errors/AppError.js';

export interface IGetInterviewRoomDetailsInput {
  interviewId: string;
  userId: string;
  role: string;
  companyId?: string;
}

export interface IGetInterviewRoomDetailsOutput {
  interviewId: string;
  roomName: string;
  scheduledDate: string;
  scheduledTime: string;
  jobTitle: string;
  companyName: string;
  candidateName: string;
  interviewerName: string;
}

@injectable()
export class GetInterviewRoomDetailsUseCase {
  constructor(
    @inject(TYPES.InterviewRepositoryPort)
    private readonly _interviewRepository: IInterviewRepository
  ) {}

  async execute(input: IGetInterviewRoomDetailsInput): Promise<IGetInterviewRoomDetailsOutput> {
    const { interviewId, userId, role, companyId } = input;

    const interview = await this._interviewRepository.findById(interviewId);
    if (!interview) {
      throw AppError.notFound('Interview not found');
    }

    this.ensureAuthorized(interview, userId, role, companyId);
    //this.ensureScheduleTimeReached(interview);

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

  private ensureScheduleTimeReached(interview: Interview): void {
    const scheduled = this.toDateTime(interview.scheduledDate, interview.scheduledTime);
    const now = new Date();

    if (now < scheduled) {
      throw AppError.forbidden(
        `Interview room will open at ${interview.scheduledDate} ${interview.scheduledTime}`
      );
    }
  }

  private toDateTime(dateStr: string, timeStr: string): Date {
    const [year, month, day] = dateStr.split('-').map((p) => Number.parseInt(p, 10));
    const [hour, minute] = timeStr.split(':').map((p) => Number.parseInt(p, 10));

    const d = new Date();
    d.setFullYear(year || d.getFullYear());
    d.setMonth((month || 1) - 1);
    d.setDate(day || d.getDate());
    d.setHours(hour || 0, minute || 0, 0, 0);
    return d;
  }
}

