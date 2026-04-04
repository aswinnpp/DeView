import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IApplicationRepository } from '../ports/repository/IApplicationRepository.js';
import type { IInterviewRepository } from '../../interview/ports/repository/IInterviewRepository.js';
import type { ICompanyProfileRepository } from '../../company/ports/repository/ICompanyProfileRepository.js';
import type { IJobRepository } from '../../job/ports/repository/IJobRepository.js';
import type { IInterviewerSlotsRepository } from '../../interviewer/ports/repository/IInterviewerSlotsRepository.js';
import type { INotificationRepository } from '../../notification/ports/repository/INotificationRepository.js';
import type { INotificationPublisher } from '../../notification/ports/service/INotificationPublisher.js';
import type { Application } from '../../../domain/entities/Application.js';
import type { ApplicationView } from '../dtos/ApplicationView.js';
import { Interview } from '../../../domain/entities/Interview.js';
import type { InterviewType } from '../../../domain/entities/Interview.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { ApplicationMapper } from '../mappers/ApplicationMapper.js';

export interface IScheduleInterviewInput {
  companyId: string;
  jobId: string;
  applicationId: string;
  round: string;
  interviewerUserId: string;
  interviewerName: string;
  interviewerEmail?: string;
  scheduledDate: string;
  scheduledTime: string;
  interviewType?: InterviewType;
  interviewLocation?: string;
  slotStartIso?: string;
}

export interface IScheduleInterviewUseCase {
  execute(input: IScheduleInterviewInput): Promise<{ application: ApplicationView }>;
}

@injectable()
export class ScheduleInterviewUseCase implements IScheduleInterviewUseCase {
  constructor(
    @inject(TYPES.ApplicationRepositoryPort)
    private readonly _applicationRepository: IApplicationRepository,
    @inject(TYPES.InterviewRepositoryPort)
    private readonly _interviewRepository: IInterviewRepository,
    @inject(TYPES.CompanyProfileRepositoryPort)
    private readonly _companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.JobRepositoryPort)
    private readonly _jobRepository: IJobRepository,
    @inject(TYPES.InterviewerSlotsRepositoryPort)
    private readonly _interviewerSlotsRepository: IInterviewerSlotsRepository,
    @inject(TYPES.NotificationRepositoryPort)
    private readonly _notificationRepository: INotificationRepository,
    @inject(TYPES.NotificationPublisherPort)
    private readonly _notificationPublisher: INotificationPublisher
  ) {}

  async execute(input: IScheduleInterviewInput): Promise<{ application: ApplicationView }> {
    const {
      companyId,
      jobId,
      applicationId,
      round,
      interviewerUserId,
      interviewerName,
      interviewerEmail,
      scheduledDate,
      scheduledTime,
      interviewType,
      interviewLocation,
      slotStartIso,
    } = input;

    const trimmedRound = String(round ?? '').trim();
    const trimmedInterviewerUserId = String(interviewerUserId ?? '').trim();
    const trimmedInterviewerName = String(interviewerName ?? '').trim();
    const trimmedInterviewerEmail = interviewerEmail ? String(interviewerEmail).trim() : undefined;
    const trimmedDate = String(scheduledDate ?? '').trim();
    const trimmedTime = String(scheduledTime ?? '').trim();
    const normalizedType = String(interviewType ?? 'ONLINE').trim().toUpperCase() as InterviewType;
    const trimmedLocation = interviewLocation ? String(interviewLocation).trim() : undefined;
    const trimmedSlotStartIso = slotStartIso ? String(slotStartIso).trim() : undefined;
    if (!['ONLINE', 'CALL', 'F2F'].includes(normalizedType)) {
      throw AppError.badRequest('Invalid interview type');
    }
    if (normalizedType === 'F2F' && !trimmedLocation) {
      throw AppError.badRequest('Interview location is required for face-to-face interviews');
    }

    if (!companyId) {
      throw AppError.badRequest('companyId is required to schedule an interview');
    }

    const existing = await this._interviewRepository.findActiveByApplicationId(applicationId);

    const app = await this._applicationRepository.findByIdAndJobId(applicationId, jobId, companyId);
    if (!app) {
      throw AppError.notFound('Application not found');
    }
    const count = await this._interviewRepository.countByCandidateUserIdAndScheduledDate(
      app.candidateUserId,
      trimmedDate,
      { excludeInterviewId: existing?.id ?? undefined }
    );
    if (count >= 4) {
      throw AppError.forbidden("Candidate has reached today's interview limit (4).");
    }


    if (trimmedSlotStartIso) {
      const asDDMMYYYY = (s: string) => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
          const [yyyy, mm, dd] = s.split('-');
          return `${dd}-${mm}-${yyyy}`;
        }
        return s;
      };
      const slotDate = asDDMMYYYY(trimmedDate);

      const docs = await this._interviewerSlotsRepository.listByInterviewer({
        interviewerId: trimmedInterviewerUserId,
        companyId,
        slotDate,
      });
      const doc = docs?.[0];
      const currentTimes = Array.isArray(doc?.times) ? doc!.times : [];
      
      const nextTimes = currentTimes.filter((t) => t !== trimmedSlotStartIso);
      await this._interviewerSlotsRepository.upsertForInterviewerDate({
        interviewerId: trimmedInterviewerUserId,
        companyId,
        slotDate,
        times: nextTimes,
        booked: nextTimes.length === 0,
      });
    }

    const updated = await this._applicationRepository.scheduleInterview({
      applicationId,
      jobId,
      companyId,
      roundDetails: {
        round: trimmedRound,
        interviewer: trimmedInterviewerName,
        interviewerEmail: trimmedInterviewerEmail,
        scheduledDate: trimmedDate,
        scheduledTime: trimmedTime,
        interviewType: normalizedType,
        interviewLocation: normalizedType === 'F2F' ? trimmedLocation : undefined,
        interviewerAccepted: false,
      },
      isReschedule: !!existing?.id,
    });

    if (!updated) {
      throw AppError.notFound('Application not found');
    }

    const companyProfile = companyId ? await this._companyProfileRepository.findById(companyId) : null;
    const companyName = companyProfile?.companyName ?? '';
    const job = await this._jobRepository.findById(jobId);
    const jobTitle = job?.title ?? '';

    if (existing?.id) {
      const keepAccepted =
        existing.interviewerUserId === trimmedInterviewerUserId ? existing.interviewerAccepted : false;
      await this._interviewRepository.rescheduleFromCompany(existing.id, {
        scheduledDate: trimmedDate,
        scheduledTime: trimmedTime,
        interviewerUserId: trimmedInterviewerUserId,
        interviewerName: trimmedInterviewerName,
        round: trimmedRound,
        interviewType: normalizedType,
        interviewLocation: normalizedType === 'F2F' ? trimmedLocation : undefined,
      });
      await this._interviewRepository.setInterviewerAccepted(existing.id, keepAccepted);
    } else {
      const roomName = normalizedType === 'ONLINE' ? `deview-interview-${applicationId}-${Date.now()}` : '';
      await this._interviewRepository.create(
        new Interview(
          null,
          companyId,
          companyName,
          jobId,
          jobTitle,
          roomName,
          applicationId,
          updated.candidateUserId,
          updated.fullName,
          trimmedInterviewerUserId,
          trimmedInterviewerName,
          trimmedRound,
          trimmedDate,
          trimmedTime,
          normalizedType,
          normalizedType === 'F2F' ? trimmedLocation : undefined,
          'SCHEDULED',
          false,
          false,
          undefined
        )
      );
    }

    const interviewerNotification = await this._notificationRepository.create({
      recipientType: 'USER',
      recipientId: trimmedInterviewerUserId,
      type: 'INTERVIEW_SCHEDULED',
      title: existing?.id ? 'Interview rescheduled' : 'New interview scheduled',
      message: `${trimmedRound} interview for ${jobTitle || 'a role'} is scheduled on ${trimmedDate} at ${trimmedTime}.`,
      data: {
        applicationId,
        jobId,
        candidateUserId: updated.candidateUserId,
        candidateName: updated.fullName,
        round: trimmedRound,
        scheduledDate: trimmedDate,
        scheduledTime: trimmedTime,
        isReschedule: Boolean(existing?.id),
      },
    });
    await this._notificationPublisher.publish({
      recipientType: 'USER',
      recipientId: trimmedInterviewerUserId,
      notification: interviewerNotification,
    });

    return { application: ApplicationMapper.toView(updated) };
  }
}
