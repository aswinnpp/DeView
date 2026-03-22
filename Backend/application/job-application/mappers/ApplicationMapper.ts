import type { Application, ApplicationStatus } from '../../../domain/entities/Application.js';
import type { ApplicationView } from '../dtos/ApplicationView.js';
import type { IListPendingApplicationsForJobInputDTO } from '../dtos/PendingApplicationsForJobDTO.js';
import type { IScoreCandidatesInputDTO, IScoreCandidateInputDTO } from '../dtos/ScoreCandidatesDTO.js';
import type { IUpdateApplicationStatusInputDTO } from '../dtos/ApplicationStatusDTO.js';
import type { IListMyApplicationsInput } from '../../candidate/ports/usecase/IListMyApplicationsUseCase.js';
import type { CallerContext } from '../../shared/types/CallerContext.js';
import type { IScheduleInterviewInput } from '../use-cases/schedule-interview.usecase.js';
import type { IDeclineRescheduleRequestInput } from '../use-cases/decline-reschedule-request.usecase.js';
import type { IGetResumeViewUrlInput } from '../use-cases/get-resume-view-url.usecase.js';
import type { IPrecheckScheduleInterviewInputDTO } from '../dtos/PrecheckScheduleInterviewDTO.js';

type CandidatePipelineTab =
  | 'pending'
  | 'shortlist'
  | 'interview'
  | 'interview_complete'
  | 'complete';

function statusesForPipelineTab(tab: CandidatePipelineTab): ApplicationStatus[] {
  switch (tab) {
    case 'pending':
      return ['PENDING'];
    case 'shortlist':
      return ['SHORTLISTED'];
    case 'interview_complete':
      return ['COMPLETED', 'INTERVIEW_COMPLETE'];
    case 'interview':
      return ['INTERVIEW_SCHEDULED', 'RESCHEDULE_REQUESTED', 'INTERVIEW_COMPLETE', 'COMPLETED', 'HIRED'];
    case 'complete':
      // UI uses "complete" tab for rejected candidates
      return ['REJECTED'];
  }
}

export const ApplicationMapper = {
  toView(app: Application): ApplicationView {
    return {
      id: app.id,
      jobId: app.jobId,
      companyId: app.companyId,
      candidateUserId: app.candidateUserId,
      fullName: app.fullName,
      email: app.email,
      phone: app.phone,
      location: app.location,
      title: app.title,
      currentCompany: app.currentCompany,
      experience: app.experience,
      bio: app.bio,
      expectedSalary: app.expectedSalary,
      noticePeriod: app.noticePeriod,
      preferredWorkMode: app.preferredWorkMode,
      preferredJobType: app.preferredJobType,
      skills: app.skills ?? [],
      education: app.education,
      university: app.university,
      graduationYear: app.graduationYear,
      linkedinUrl: app.linkedinUrl,
      githubUrl: app.githubUrl,
      resumeUrl: app.resumeUrl,
      coverLetter: app.coverLetter,
      status: app.status,
      aiScore: app.aiScore,
      interviewDetails:
        app.interviewDetails ??
        (app.interviewRounds?.length ? app.interviewRounds[app.interviewRounds.length - 1] : undefined),
      interviewRounds: app.interviewRounds ?? [],
      rescheduleRequest: app.rescheduleRequest
        ? {
            originalDate: app.rescheduleRequest.originalDate,
            originalTime: app.rescheduleRequest.originalTime,
            requestedDate: app.rescheduleRequest.requestedDate,
            requestedTime: app.rescheduleRequest.requestedTime,
            reason: app.rescheduleRequest.reason,
            requestedAt:
              app.rescheduleRequest.requestedAt instanceof Date
                ? app.rescheduleRequest.requestedAt.toISOString()
                : String(app.rescheduleRequest.requestedAt),
          }
        : undefined,
      completedRounds: app.completedRounds ?? [],
      createdAt: app.createdAt instanceof Date ? app.createdAt.toISOString() : String(app.createdAt),
      updatedAt: app.updatedAt instanceof Date ? app.updatedAt.toISOString() : String(app.updatedAt),
    };
  },

  toListView(applications: Application[]): ApplicationView[] {
    return applications.map((app) => ApplicationMapper.toView(app));
  },

  toListPendingInput(
    params: { jobId: string },
    query: {
      status?:
        | 'PENDING'
        | 'SHORTLISTED'
        | 'INTERVIEW_SCHEDULED'
        | 'INTERVIEW_COMPLETE'
        | 'COMPLETED'
        | 'HIRED'
        | 'REJECTED'
        | 'RESCHEDULE_REQUESTED';
      pipelineTab?: CandidatePipelineTab;
    },
    context: CallerContext
  ): IListPendingApplicationsForJobInputDTO {
    const pipelineTab = query?.pipelineTab;
    const statuses = pipelineTab ? statusesForPipelineTab(pipelineTab) : undefined;
    return {
      jobId: params.jobId,
      companyId: context.companyId || '',
      status: query?.status as ApplicationStatus | undefined,
      statuses,
    };
  },

  toScoreCandidatesInput(
    params: { jobId: string },
    body: { candidates: unknown[] },
    context: CallerContext
  ): IScoreCandidatesInputDTO {
    const candidates = (Array.isArray(body?.candidates) ? body.candidates : []).map(
      (c): IScoreCandidateInputDTO => ({
        applicationId: String((c as Record<string, unknown>)?.applicationId ?? ''),
        name: String((c as Record<string, unknown>)?.name ?? ''),
        email: (c as Record<string, unknown>)?.email != null ? String((c as Record<string, unknown>).email) : undefined,
        phone: (c as Record<string, unknown>)?.phone != null ? String((c as Record<string, unknown>).phone) : undefined,
        location: (c as Record<string, unknown>)?.location != null ? String((c as Record<string, unknown>).location) : undefined,
        experience: (c as Record<string, unknown>)?.experience != null ? String((c as Record<string, unknown>).experience) : undefined,
        education: (c as Record<string, unknown>)?.education != null ? String((c as Record<string, unknown>).education) : undefined,
        skills: (c as Record<string, unknown>)?.skills != null ? String((c as Record<string, unknown>).skills) : undefined,
        coverLetter: (c as Record<string, unknown>)?.coverLetter != null ? String((c as Record<string, unknown>).coverLetter) : undefined,
        bio: (c as Record<string, unknown>)?.bio != null ? String((c as Record<string, unknown>).bio) : undefined,
        title: (c as Record<string, unknown>)?.title != null ? String((c as Record<string, unknown>).title) : undefined,
        currentCompany: (c as Record<string, unknown>)?.currentCompany != null ? String((c as Record<string, unknown>).currentCompany) : undefined,
        expectedSalary: (c as Record<string, unknown>)?.expectedSalary != null ? String((c as Record<string, unknown>).expectedSalary) : undefined,
        noticePeriod: (c as Record<string, unknown>)?.noticePeriod != null ? String((c as Record<string, unknown>).noticePeriod) : undefined,
        preferredWorkMode: (c as Record<string, unknown>)?.preferredWorkMode != null ? String((c as Record<string, unknown>).preferredWorkMode) : undefined,
        preferredJobType: (c as Record<string, unknown>)?.preferredJobType != null ? String((c as Record<string, unknown>).preferredJobType) : undefined,
        university: (c as Record<string, unknown>)?.university != null ? String((c as Record<string, unknown>).university) : undefined,
        graduationYear: (c as Record<string, unknown>)?.graduationYear != null ? String((c as Record<string, unknown>).graduationYear) : undefined,
        linkedinUrl: (c as Record<string, unknown>)?.linkedinUrl != null ? String((c as Record<string, unknown>).linkedinUrl) : undefined,
        githubUrl: (c as Record<string, unknown>)?.githubUrl != null ? String((c as Record<string, unknown>).githubUrl) : undefined,
      })
    );
    return {
      jobId: params.jobId,
      companyId: context.companyId || '',
      candidates,
    };
  },

  toUpdateStatusInput(
    params: { jobId: string; applicationId: string },
    body: {
      status:
        | 'PENDING'
        | 'SHORTLISTED'
        | 'INTERVIEW_SCHEDULED'
        | 'INTERVIEW_COMPLETE'
        | 'COMPLETED'
        | 'HIRED'
        | 'REJECTED'
        | 'RESCHEDULE_REQUESTED';
      rejectionEmailContent?: string;
    },
    context: CallerContext
  ): IUpdateApplicationStatusInputDTO {
    return {
      applicationId: params.applicationId,
      jobId: params.jobId,
      companyId: context.companyId || '',
      status: body.status as ApplicationStatus,
      rejectionEmailContent: body.rejectionEmailContent,
    };
  },

  toListMyApplicationsInput(input: {
    candidateUserId: string;
    status?:
      | 'PENDING'
      | 'SHORTLISTED'
      | 'INTERVIEW_SCHEDULED'
      | 'INTERVIEW_COMPLETE'
      | 'HIRED'
      | 'REJECTED'
      | 'RESCHEDULE_REQUESTED';
    search?: string;
    page?: number | string;
    limit?: number | string;
    sortOrder?: 'asc' | 'desc';
  }): IListMyApplicationsInput {
    const page =
      typeof input.page === 'number'
        ? input.page
        : input.page != null
          ? Number(input.page)
          : undefined;

    const limit =
      typeof input.limit === 'number'
        ? input.limit
        : input.limit != null
          ? Number(input.limit)
          : undefined;

    return {
      candidateUserId: input.candidateUserId,
      search: input.search,
      status: input.status as ApplicationStatus | undefined,
      page,
      limit,
      sortOrder: input.sortOrder,
    };
  },

  toScheduleInterviewInput(
    params: { jobId: string; applicationId: string },
    body: {
      round: string;
      interviewerUserId: string;
      interviewerName: string;
      interviewerEmail?: string;
      scheduledDate: string;
      scheduledTime: string;
      slotStartIso?: string;
    },
    context: CallerContext
  ): IScheduleInterviewInput {
    return {
      companyId: context.companyId || '',
      jobId: params.jobId,
      applicationId: params.applicationId,
      round: body.round,
      interviewerUserId: body.interviewerUserId,
      interviewerName: body.interviewerName,
      interviewerEmail: body.interviewerEmail,
      scheduledDate: body.scheduledDate,
      scheduledTime: body.scheduledTime,
      slotStartIso: body.slotStartIso,
    };
  },

  toDeclineRescheduleRequestInput(
    params: { jobId: string; applicationId: string },
    context: CallerContext
  ): IDeclineRescheduleRequestInput {
    return {
      companyId: context.companyId || '',
      jobId: params.jobId,
      applicationId: params.applicationId,
    };
  },

  toGetResumeViewUrlInput(
    params: { jobId: string; applicationId: string },
    context: CallerContext
  ): IGetResumeViewUrlInput {
    return {
      companyId: context.companyId || '',
      jobId: params.jobId,
      applicationId: params.applicationId,
    };
  },

  toPrecheckScheduleInterviewInput(
    params: { jobId: string; applicationId: string },
    query: { scheduledDate?: string },
    context: CallerContext
  ): IPrecheckScheduleInterviewInputDTO {
    return {
      companyId: context.companyId || '',
      jobId: params.jobId,
      applicationId: params.applicationId,
      scheduledDate: query?.scheduledDate,
    };
  },
};
