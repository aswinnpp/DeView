import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IInterviewRepository } from '../../interview/ports/repository/IInterviewRepository.js';
import type { IScheduleInterviewUseCase, IScheduleInterviewInput } from './schedule-interview.usecase.js';
import type { ApplicationView } from '../dtos/ApplicationView.js';
import { AppError } from '../../../shared/errors/AppError.js';

export interface IRescheduleInterviewInput {
  companyId: string;
  jobId: string;
  applicationId: string;
  interviewerUserId: string;
  interviewerName: string;
  interviewerEmail?: string;
  scheduledDate: string;
  scheduledTime: string;
  interviewType?: 'ONLINE' | 'CALL' | 'F2F';
  interviewLocation?: string;
  slotStartIso?: string;
}

export interface IRescheduleInterviewUseCase {
  execute(input: IRescheduleInterviewInput): Promise<{ application: ApplicationView }>;
}

@injectable()
export class RescheduleInterviewUseCase implements IRescheduleInterviewUseCase {
  constructor(
    @inject(TYPES.InterviewRepositoryPort) private readonly _interviewRepository: IInterviewRepository,
    @inject(TYPES.ScheduleInterviewUseCasePort) private readonly _scheduleInterviewUseCase: IScheduleInterviewUseCase,
  ) {}

  async execute(input: IRescheduleInterviewInput): Promise<{ application: ApplicationView }> {
  
      const existing = await this._interviewRepository.findActiveByApplicationId(input.applicationId);
      if (!existing) {
        throw AppError.notFound('Active interview not found for rescheduling');
      }

      const scheduleInput: IScheduleInterviewInput = {
        companyId: input.companyId,
        jobId: input.jobId,
        applicationId: input.applicationId,
        round: existing.round,
        interviewerUserId: input.interviewerUserId,
        interviewerName: input.interviewerName,
        interviewerEmail: input.interviewerEmail,
        scheduledDate: input.scheduledDate,
        scheduledTime: input.scheduledTime,
        interviewType: input.interviewType,
        interviewLocation: input.interviewLocation,
        slotStartIso: input.slotStartIso,
      };

      return this._scheduleInterviewUseCase.execute(scheduleInput);
    
  }
}

