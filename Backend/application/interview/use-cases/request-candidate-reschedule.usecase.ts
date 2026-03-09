import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import { AppError } from '../../../shared/errors/AppError.js';
import type { IInterviewRepository } from '../ports/repository/IInterviewRepository.js';
import type { IApplicationRepository } from '../../application/ports/repository/IApplicationRepository.js';
import type { Interview } from '../../../domain/interview/entities/Interview.js';

export interface IRequestCandidateRescheduleUseCase {
  execute(input: {
    interviewId: string;
    candidateUserId: string;
    requestedDate: string;
    reason: string;
  }): Promise<{ interview: Interview }>;
}

@injectable()
export class RequestCandidateRescheduleUseCase implements IRequestCandidateRescheduleUseCase {
  constructor(
    @inject(TYPES.InterviewRepositoryPort) private readonly interviewRepo: IInterviewRepository,
    @inject(TYPES.ApplicationRepositoryPort) private readonly applicationRepo: IApplicationRepository
  ) {}

  async execute(input: {
    interviewId: string;
    candidateUserId: string;
    requestedDate: string;
    reason: string;
  }): Promise<{ interview: Interview }> {
    const requestedDate = String(input.requestedDate ?? '').trim();
    const reason = String(input.reason ?? '').trim();
    if (!requestedDate) throw AppError.badRequest('requestedDate is required');
    if (!reason) throw AppError.badRequest('reason is required');

    const interview = await this.interviewRepo.findById(input.interviewId);
    if (!interview) throw AppError.notFound('Interview not found');
    if (interview.candidateUserId !== input.candidateUserId) {
      throw AppError.forbidden('You are not allowed to reschedule this interview');
    }
    if (interview.status === 'COMPLETED' || interview.status === 'CANCELLED') {
      throw AppError.badRequest('Cannot reschedule a completed or cancelled interview');
    }

    const updatedInterview = await this.interviewRepo.setCandidateRejection(interview.id || input.interviewId, {
      date: requestedDate,
      reason,
    });
    if (!updatedInterview) throw AppError.notFound('Interview not found');

    // Store request also on the application so HR can see it in Reschedule Requests tab.
    await this.applicationRepo.setRescheduleRequest({
      applicationId: interview.applicationId,
      jobId: interview.jobId,
      companyId: interview.companyId,
      rescheduleRequest: {
        originalDate: interview.scheduledDate,
        originalTime: interview.scheduledTime,
        requestedDate,
        requestedTime: interview.scheduledTime,
        reason,
        requestedAt: new Date(),
      },
    });

    return { interview: updatedInterview };
  }
}

