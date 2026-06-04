import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IInterviewRepository } from '../ports/repository/IInterviewRepository.js';
import type { IApplicationRepository } from '../../job-application/ports/repository/IApplicationRepository.js';
import type { INotificationRepository } from '../../notification/ports/repository/INotificationRepository.js';
import type { INotificationPublisher } from '../../notification/ports/service/INotificationPublisher.js';
import type { IRejectInterviewAssignmentUseCase } from '../ports/usecase/IRejectInterviewAssignmentUseCase.js';
import type {
  IRejectInterviewAssignmentInputDTO,
  IRejectInterviewAssignmentOutputDTO,
} from '../dtos/InterviewCommandDTO.js';

@injectable()
export class RejectInterviewAssignmentUseCase implements IRejectInterviewAssignmentUseCase {
  constructor(
    @inject(TYPES.InterviewRepositoryPort) private readonly _repo: IInterviewRepository,
    @inject(TYPES.ApplicationRepositoryPort)
    private readonly _applicationRepo: IApplicationRepository,
    @inject(TYPES.NotificationRepositoryPort)
    private readonly _notificationRepository: INotificationRepository,
    @inject(TYPES.NotificationPublisherPort)
    private readonly _notificationPublisher: INotificationPublisher,
  ) {}

  async execute(input: IRejectInterviewAssignmentInputDTO): Promise<IRejectInterviewAssignmentOutputDTO> {
    const interview = await this._repo.findById(input.interviewId);
    if (!interview || interview.interviewerUserId !== input.interviewerUserId) {
      return { data: null };
    }


    const updated = await this._repo.setInterviewerAccepted(input.interviewId, false, input.reason.trim());
    if (updated) {
      await this._repo.updateStatus(updated.id ?? input.interviewId, 'RESCHEDULED');


 
   
      await this._applicationRepo.setInterviewAcceptance({
        applicationId: updated.applicationId,
        jobId: updated.jobId,
        companyId: updated.companyId,
        round: updated.round,
        interviewerAccepted: false,
        interviewerRejectReason: input.reason.trim(),
      });

      // Move the application to reschedule pipeline so the company can propose a new slot.
      await this._applicationRepo.updateStatus({
        applicationId: updated.applicationId,
        jobId: updated.jobId,
        companyId: updated.companyId,
        status: 'RESCHEDULE_REQUESTED',
      });

      const reason = input.reason.trim();
      const notification = await this._notificationRepository.create({
        recipientType: 'COMPANY',
        recipientId: updated.companyId,
        type: 'INTERVIEW_RESCHEDULE_REQUESTED',
        title: 'Interview reschedule requested',
        message: `${updated.interviewerName} requested to reschedule ${updated.candidateName}'s ${updated.round} interview for ${updated.jobTitle}.${reason ? ` Reason: ${reason}` : ''}`,
        data: {
          interviewId: updated.id ?? input.interviewId,
          applicationId: updated.applicationId,
          jobId: updated.jobId,
          companyId: updated.companyId,
          round: updated.round,
          status: 'RESCHEDULE_REQUESTED',
        },
      });

      await this._notificationPublisher.publish({
        recipientType: 'COMPANY',
        recipientId: updated.companyId,
        notification,
      });
    }
    return { data: updated };
  }
}
