import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IApplicationRepository } from '../ports/repository/IApplicationRepository.js';
import type { IInterviewRepository } from '../../interview/ports/repository/IInterviewRepository.js';
import type { ICompanyProfileRepository } from '../../company/ports/repository/ICompanyProfileRepository.js';
import type { IJobRepository } from '../../job/ports/repository/IJobRepository.js';
import type { Application } from '../../../domain/application/entities/Application.js';
import { Interview } from '../../../domain/interview/entities/Interview.js';
import { AppError } from '../../../shared/errors/AppError.js';

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
}

export interface IScheduleInterviewUseCase {
  execute(input: IScheduleInterviewInput): Promise<{ application: Application }>;
}

@injectable()
export class ScheduleInterviewUseCase implements IScheduleInterviewUseCase {
  constructor(
    @inject(TYPES.ApplicationRepositoryPort)
    private readonly applicationRepository: IApplicationRepository,
    @inject(TYPES.InterviewRepositoryPort)
    private readonly interviewRepository: IInterviewRepository,
    @inject(TYPES.CompanyProfileRepositoryPort)
    private readonly companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.JobRepositoryPort)
    private readonly jobRepository: IJobRepository
  ) {}

  async execute(input: IScheduleInterviewInput): Promise<{ application: Application }> {
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
    } = input;

    const updated = await this.applicationRepository.scheduleInterview({
      applicationId,
      jobId,
      companyId,
      interviewDetails: {
        round: String(round ?? '').trim(),
        interviewer: String(interviewerName ?? '').trim(),
        interviewerEmail: interviewerEmail ? String(interviewerEmail).trim() : undefined,
        scheduledDate: String(scheduledDate ?? '').trim(),
        scheduledTime: String(scheduledTime ?? '').trim(),
      },
    });

    if (!updated) {
      throw AppError.notFound('Application not found');
    }

    const companyProfile = companyId ? await this.companyProfileRepository.findById(companyId) : null;
    const companyName = companyProfile?.companyName ?? '';
    const job = await this.jobRepository.findById(jobId);
    const jobTitle = job?.title ?? '';

    const trimmedDate = String(scheduledDate ?? '').trim();
    const trimmedTime = String(scheduledTime ?? '').trim();
    const trimmedInterviewerUserId = String(interviewerUserId ?? '').trim();
    const trimmedInterviewerName = String(interviewerName ?? '').trim();
    const trimmedRound = String(round ?? '').trim();

    const existing = await this.interviewRepository.findActiveByApplicationId(applicationId);
    if (existing?.id) {
      const keepAccepted =
        existing.interviewerUserId === trimmedInterviewerUserId ? existing.interviewerAccepted : false;
      await this.interviewRepository.rescheduleFromCompany(existing.id, {
        scheduledDate: trimmedDate,
        scheduledTime: trimmedTime,
        interviewerUserId: trimmedInterviewerUserId,
        interviewerName: trimmedInterviewerName,
        round: trimmedRound,
      });
      await this.interviewRepository.setInterviewerAccepted(existing.id, keepAccepted);
    } else {
      const roomName = `deview-interview-${applicationId}-${Date.now()}`;
      await this.interviewRepository.create(
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
          'SCHEDULED',
          false,
          undefined
        )
      );
    }

    return { application: updated };
  }
}
