import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IInterviewRepository } from '../ports/repository/IInterviewRepository.js';
import type { IAcceptInterviewAssignmentUseCase } from '../ports/usecase/IAcceptInterviewAssignmentUseCase.js';
import type { INotificationRepository } from '../../notification/ports/repository/INotificationRepository.js';
import type { INotificationPublisher } from '../../notification/ports/service/INotificationPublisher.js';
import type {
  IAcceptInterviewAssignmentInputDTO,
  IAcceptInterviewAssignmentOutputDTO,
} from '../dtos/InterviewCommandDTO.js';

@injectable()
export class AcceptInterviewAssignmentUseCase implements IAcceptInterviewAssignmentUseCase {
  constructor(
    @inject(TYPES.InterviewRepositoryPort) private readonly _repo: IInterviewRepository,
    @inject(TYPES.NotificationRepositoryPort) private readonly _notificationRepo: INotificationRepository,
    @inject(TYPES.NotificationPublisherPort) private readonly _notificationPublisher: INotificationPublisher
  ) {}

  async execute(input: IAcceptInterviewAssignmentInputDTO): Promise<IAcceptInterviewAssignmentOutputDTO> {
    const interview = await this._repo.findById(input.interviewId);
    if (!interview || interview.interviewerUserId !== input.interviewerUserId) {
      return { data: null };
    }
    const updated = await this._repo.setInterviewerAccepted(input.interviewId, true);
    if (updated) {
      const notification = await this._notificationRepo.create({
        recipientType: 'USER',
        recipientId: updated.candidateUserId,
        type: 'INTERVIEW_SCHEDULED',
        title: 'Interview scheduled',
        message: `${updated.round} interview for ${updated.jobTitle || 'your application'} is set on ${updated.scheduledDate} at ${updated.scheduledTime}.`,
        data: {
          interviewId: updated.id,
          applicationId: updated.applicationId,
          jobId: updated.jobId,
          round: updated.round,
          scheduledDate: updated.scheduledDate,
          scheduledTime: updated.scheduledTime,
          interviewerUserId: updated.interviewerUserId,
          interviewerName: updated.interviewerName,
        },
      });
      await this._notificationPublisher.publish({
        recipientType: 'USER',
        recipientId: updated.candidateUserId,
        notification,
      });
    }
    return { data: updated };
  }
}
