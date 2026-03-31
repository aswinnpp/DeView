import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import { AppError } from '../../../shared/errors/AppError.js';
import type { IInterviewRepository } from '../ports/repository/IInterviewRepository.js';
import type { IApplicationRepository } from '../../job-application/ports/repository/IApplicationRepository.js';
import type { INotificationRepository } from '../../notification/ports/repository/INotificationRepository.js';
import type { INotificationPublisher } from '../../notification/ports/service/INotificationPublisher.js';
import type { IRequestCandidateRescheduleUseCase } from '../ports/usecase/IRequestCandidateRescheduleUseCase.js';
import type {
  IRequestCandidateRescheduleInputDTO,
  IRequestCandidateRescheduleOutputDTO,
} from '../dtos/InterviewCommandDTO.js';

@injectable()
export class RequestCandidateRescheduleUseCase implements IRequestCandidateRescheduleUseCase {
  constructor(
    @inject(TYPES.InterviewRepositoryPort) private readonly _interviewRepo: IInterviewRepository,
    @inject(TYPES.ApplicationRepositoryPort) private readonly _applicationRepo: IApplicationRepository,
    @inject(TYPES.NotificationRepositoryPort) private readonly _notificationRepo: INotificationRepository,
    @inject(TYPES.NotificationPublisherPort) private readonly _notificationPublisher: INotificationPublisher
  ) {}

  async execute(input: IRequestCandidateRescheduleInputDTO): Promise<IRequestCandidateRescheduleOutputDTO> {
    const requestedDate = String(input.requestedDate ?? '').trim();
    const reason = String(input.reason ?? '').trim();
    if (!requestedDate) throw AppError.badRequest('requestedDate is required');
    if (!reason) throw AppError.badRequest('reason is required');

    const interview = await this._interviewRepo.findById(input.interviewId);
    if (!interview) throw AppError.notFound('Interview not found');
    if (interview.candidateUserId !== input.candidateUserId) {
      throw AppError.forbidden('You are not allowed to reschedule this interview');
    }
    if (interview.status === 'COMPLETED' || interview.status === 'CANCELLED') {
      throw AppError.badRequest('Cannot reschedule a completed or cancelled interview');
    }

    const updatedInterview = await this._interviewRepo.setCandidateRejection(interview.id || input.interviewId, {
      date: requestedDate,
      reason,
    });
    if (!updatedInterview) throw AppError.notFound('Interview not found');

    await this._applicationRepo.setRescheduleRequest({
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

    // Notify interviewer + company so they can propose a new slot.
    const notificationType = 'INTERVIEW_RESCHEDULE_REQUESTED';
    const title = 'Reschedule request received';
    const message = `${interview.candidateName} requested to reschedule your ${interview.round} interview from ${interview.scheduledDate} to ${requestedDate}. Reason: ${reason}`;

    const interviewerNotification = await this._notificationRepo.create({
      recipientType: 'USER',
      recipientId: interview.interviewerUserId,
      type: notificationType,
      title,
      message,
      data: {
        interviewId: interview.id,
        applicationId: interview.applicationId,
        jobId: interview.jobId,
        companyId: interview.companyId,
        candidateName: interview.candidateName,
        round: interview.round,
        requestedDate,
        requestedTime: interview.scheduledTime,
      },
    });
    await this._notificationPublisher.publish({
      recipientType: 'USER',
      recipientId: interview.interviewerUserId,
      notification: interviewerNotification,
    });

    const companyNotification = await this._notificationRepo.create({
      recipientType: 'COMPANY',
      recipientId: interview.companyId,
      type: notificationType,
      title,
      message,
      data: {
        interviewId: interview.id,
        applicationId: interview.applicationId,
        jobId: interview.jobId,
        companyId: interview.companyId,
        candidateName: interview.candidateName,
        round: interview.round,
        requestedDate,
        requestedTime: interview.scheduledTime,
      },
    });
    await this._notificationPublisher.publish({
      recipientType: 'COMPANY',
      recipientId: interview.companyId,
      notification: companyNotification,
    });

    return { interview: updatedInterview };
  }
}
