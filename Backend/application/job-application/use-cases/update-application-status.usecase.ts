import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IApplicationRepository } from '../ports/repository/IApplicationRepository.js';
import type { IRejectionMailRepository } from '../ports/repository/IRejectionMailRepository.js';
import type { IOfferMailRepository } from '../ports/repository/IOfferMailRepository.js';
import type { INotificationRepository } from '../../notification/ports/repository/INotificationRepository.js';
import type { INotificationPublisher } from '../../notification/ports/service/INotificationPublisher.js';
import type { IJobRepository } from '../../job/ports/repository/IJobRepository.js';
import type { IInterviewRepository } from '../../interview/ports/repository/IInterviewRepository.js';
import type {
  IUpdateApplicationStatusUseCase,
} from '../ports/usecase/IUpdateApplicationStatusUseCase.js';
import type {
  IUpdateApplicationStatusInputDTO,
  IUpdateApplicationStatusOutputDTO,
} from '../dtos/ApplicationStatusDTO.js';
import { AppError } from '../../../shared/errors/AppError.js';

@injectable()
export class UpdateApplicationStatusUseCase implements IUpdateApplicationStatusUseCase {
  constructor(
    @inject(TYPES.ApplicationRepositoryPort)
    private readonly _applicationRepository: IApplicationRepository,
    @inject(TYPES.RejectionMailRepositoryPort)
    private readonly _rejectionMailRepository: IRejectionMailRepository,
    @inject(TYPES.OfferMailRepositoryPort)
    private readonly _offerMailRepository: IOfferMailRepository,
    @inject(TYPES.NotificationRepositoryPort)
    private readonly _notificationRepository: INotificationRepository,
    @inject(TYPES.NotificationPublisherPort)
    private readonly _notificationPublisher: INotificationPublisher,
    @inject(TYPES.JobRepositoryPort)
    private readonly _jobRepository: IJobRepository,
    @inject(TYPES.InterviewRepositoryPort)
    private readonly _interviewRepository: IInterviewRepository
  ) {}

  async execute(input: IUpdateApplicationStatusInputDTO): Promise<IUpdateApplicationStatusOutputDTO> {
    const existing = await this._applicationRepository.findByIdAndJobId(
      input.applicationId,
      input.jobId,
      input.companyId
    );
    if (!existing) {
      throw AppError.notFound('Application not found');
    }

    if (input.status === 'HIRED' || input.status === 'REJECTED') {
      const hasInterviewTrail =
        (existing.interviewRounds?.length ?? 0) > 0 || Boolean(existing.interviewDetails);
      if (hasInterviewTrail) {
        const latestCompleted = await this._interviewRepository.findLatestCompletedByApplicationId(
          input.applicationId
        );
        if (!latestCompleted || !latestCompleted.feedbackSubmitted) {
          throw AppError.forbidden('Interviewer feedback PENDING');
        }
      }
    }

    const updated = await this._applicationRepository.updateStatus(input);

    if (!updated) {
      throw AppError.notFound('Application not found');
    }

    if (updated.status === 'SHORTLISTED') {
      const job = await this._jobRepository.findById(updated.jobId);
      const jobTitle = job?.title ?? 'the role';
      const notification = await this._notificationRepository.create({
        recipientType: 'USER',
        recipientId: updated.candidateUserId,
        type: 'APPLICATION_SHORTLISTED',
        title: 'You are shortlisted',
        message: `You have been shortlisted for ${jobTitle}.`,
        data: {
          applicationId: updated.id ?? input.applicationId,
          jobId: updated.jobId,
          status: updated.status,
        },
      });
      await this._notificationPublisher.publish({
        recipientType: 'USER',
        recipientId: updated.candidateUserId,
        notification,
      });
    }

    if (
      updated.status === 'REJECTED' &&
      input.rejectionEmailContent &&
      input.rejectionEmailContent.trim().length > 0 &&
      !existing.rejectionSentAt
    ) {
      const job = await this._jobRepository.findById(updated.jobId);
      const jobTitle = job?.title ?? 'the role';

      await this._rejectionMailRepository.create({
        applicationId: updated.id || input.applicationId,
        jobId: updated.jobId,
        companyId: updated.companyId,
        candidateUserId: updated.candidateUserId,
        candidateName: updated.fullName,
        candidateEmail: updated.email,
        content: input.rejectionEmailContent,
      });

      const notification = await this._notificationRepository.create({
        recipientType: 'USER',
        recipientId: updated.candidateUserId,
        type: 'APPLICATION_REJECTED',
        title: 'Update: Application status',
        message: `You received a rejection update for ${jobTitle}.`,
        data: {
          applicationId: updated.id ?? input.applicationId,
          jobId: updated.jobId,
          status: updated.status,
        },
      });

      await this._notificationPublisher.publish({
        recipientType: 'USER',
        recipientId: updated.candidateUserId,
        notification,
      });
    }

    if (
      updated.status === 'HIRED' &&
      input.offerEmailContent &&
      input.offerEmailContent.trim().length > 0 &&
      !existing.offerSentAt
    ) {
      const job = await this._jobRepository.findById(updated.jobId);
      const jobTitle = job?.title ?? 'the role';

      await this._offerMailRepository.create({
        applicationId: updated.id || input.applicationId,
        jobId: updated.jobId,
        companyId: updated.companyId,
        candidateUserId: updated.candidateUserId,
        candidateName: updated.fullName,
        candidateEmail: updated.email,
        content: input.offerEmailContent.trim(),
        salary: input.offerSalary,
        location: input.offerLocation,
        startDate: input.offerStartDate,
        benefits: input.offerBenefits,
      });

      const notification = await this._notificationRepository.create({
        recipientType: 'USER',
        recipientId: updated.candidateUserId,
        type: 'APPLICATION_OFFERED',
        title: 'Congratulations! Offer available',
        message: `You received an offer letter for ${jobTitle}.`,
        data: {
          applicationId: updated.id ?? input.applicationId,
          jobId: updated.jobId,
          status: updated.status,
        },
      });

      await this._notificationPublisher.publish({
        recipientType: 'USER',
        recipientId: updated.candidateUserId,
        notification,
      });
    }

    return { application: updated };
  }
}
