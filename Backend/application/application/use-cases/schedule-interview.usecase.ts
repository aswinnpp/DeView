import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IApplicationRepository } from '../ports/repository/IApplicationRepository.js';
import type { IInterviewRepository } from '../../interview/ports/repository/IInterviewRepository.js';
import type { ICompanyProfileRepository } from '../../company/ports/repository/ICompanyProfileRepository.js';
import type { IJobRepository } from '../../job/ports/repository/IJobRepository.js';
import type { IInterviewerSlotsRepository } from '../../interviewer/ports/repository/IInterviewerSlotsRepository.js';
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
  /** ISO start time string for slot reservation (used to remove booked slot) */
  slotStartIso?: string;
}

export interface IScheduleInterviewUseCase {
  execute(input: IScheduleInterviewInput): Promise<{ application: Application }>;
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
    private readonly _interviewerSlotsRepository: IInterviewerSlotsRepository
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
      slotStartIso,
    } = input;

    const trimmedRound = String(round ?? '').trim();
    const trimmedInterviewerUserId = String(interviewerUserId ?? '').trim();
    const trimmedInterviewerName = String(interviewerName ?? '').trim();
    const trimmedInterviewerEmail = interviewerEmail ? String(interviewerEmail).trim() : undefined;
    const trimmedDate = String(scheduledDate ?? '').trim();
    const trimmedTime = String(scheduledTime ?? '').trim();
    const trimmedSlotStartIso = slotStartIso ? String(slotStartIso).trim() : undefined;

    if (!companyId) {
      throw AppError.badRequest('companyId is required to schedule an interview');
    }

    const existing = await this._interviewRepository.findActiveByApplicationId(applicationId);

    // Note: subscription/feedback/limits validations are handled by precheck endpoint.

    // ── Guard: a candidate can attend max 4 interviews per day ──
    // Always enforce during actual scheduling (authoritative).
    const app = await this._applicationRepository.findByIdAndJobId(applicationId, jobId, companyId);
    if (!app) {
      throw AppError.notFound('Application not found');
    }
    const count = await this._interviewRepository.countByCandidateUserIdAndScheduledDate(
      app.candidateUserId,
      trimmedDate,
      { excludeInterviewId: existing?.id ?? undefined }
    );
    if (count >= 1) {
      throw AppError.forbidden("Candidate has reached today's interview limit (4).");
    }

    // ── Reserve (remove) the selected interviewer slot so it can't be double-booked ──
    // This is best-effort for legacy clients that don't send slotStartIso.
    if (trimmedSlotStartIso) {
      const asDDMMYYYY = (s: string) => {
        // Accept both YYYY-MM-DD and DD-MM-YYYY
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
      if (!currentTimes.includes(trimmedSlotStartIso)) {
        throw AppError.conflict('This slot is already booked. Please choose another time.');
      }
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
      });
      await this._interviewRepository.setInterviewerAccepted(existing.id, keepAccepted);
    } else {
      const roomName = `deview-interview-${applicationId}-${Date.now()}`;
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
          'SCHEDULED',
          false,
          false,
          undefined
        )
      );
    }

    return { application: updated };
  }
}
