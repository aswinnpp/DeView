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
import type { IListOfferMailsInputDTO, IListOfferMailsResult } from '../dtos/ListOfferMailsDTO.js';
import type { IGetLatestInterviewerFeedbackInput } from '../use-cases/get-latest-interviewer-feedback.usecase.js';
import type { IRespondToCounterLetterInput } from '../use-cases/respond-to-counter-letter.usecase.js';
import type { GetSignedOfferPdfRequest } from '../use-cases/get-signed-offer-pdf.usecase.js';
import type { IApplyForJobInput } from '../../candidate/ports/usecase/IApplyForJobUseCase.js';
import type { CandidateMailboxKind } from '../../candidate/use-cases/list-candidate-mailbox.usecase.js';
import type { OfferMail } from '../../../domain/entities/OfferMail.js';
import type { ISubmitOfferCounterLetterResult } from '../../candidate/use-cases/submit-offer-counter-letter.usecase.js';

type CandidatePipelineTab =
  | 'pending'
  | 'shortlist'
  | 'interview'
  | 'interview_complete'
  | 'complete';

type OfferMailStatus = 'pending' | 'accepted' | 'declined' | 'counter';

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

function toIsoString(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (value instanceof Date) return value.toISOString();
  return String(value);
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
      educationList: app.educationList ?? [],
      workExperience: app.workExperience ?? [],
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
      rejectionEmailContent: app.rejectionEmailContent,
      rejectionSentAt:
        app.rejectionSentAt instanceof Date
          ? app.rejectionSentAt.toISOString()
          : app.rejectionSentAt != null
            ? String(app.rejectionSentAt)
            : undefined,
      offerEmailContent: app.offerEmailContent,
      offerSentAt:
        app.offerSentAt instanceof Date
          ? app.offerSentAt.toISOString()
          : app.offerSentAt != null
            ? String(app.offerSentAt)
            : undefined,
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
      offerEmailContent?: string;
      offerSalary?: string;
      offerLocation?: string;
      offerStartDate?: string;
      offerBenefits?: string;
    },
    context: CallerContext
  ): IUpdateApplicationStatusInputDTO {
    return {
      applicationId: params.applicationId,
      jobId: params.jobId,
      companyId: context.companyId || '',
      status: body.status as ApplicationStatus,
      rejectionEmailContent: body.rejectionEmailContent,
      offerEmailContent: body.offerEmailContent,
      offerSalary: body.offerSalary,
      offerLocation: body.offerLocation,
      offerStartDate: body.offerStartDate,
      offerBenefits: body.offerBenefits,
    };
  },

  toListMyApplicationsInput(input: {
    candidateUserId: string;
    status?:
      | 'PENDING'
      | 'SHORTLISTED'
      | 'INTERVIEW_SCHEDULED'
      | 'INTERVIEW_COMPLETE'
      | 'COMPLETED'
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
      interviewType?: 'ONLINE' | 'CALL' | 'F2F';
      interviewLocation?: string;
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
      interviewType: body.interviewType,
      interviewLocation: body.interviewLocation,
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

  toListOfferMailsInput(
    query: {
      jobId?: string;
      status?: OfferMailStatus;
      search?: string;
      page?: number;
      limit?: number;
    },
    context: CallerContext
  ): IListOfferMailsInputDTO {
    return {
      companyId: context.companyId || '',
      jobId: query.jobId,
      status: query.status,
      search: query.search,
      page: query.page,
      limit: query.limit,
    };
  },

  toOfferMailsListView(result: IListOfferMailsResult): {
    data: Array<{
      id?: string | null;
      applicationId: string;
      jobId: string;
      companyId: string;
      candidateUserId: string;
      candidateName: string;
      candidateEmail: string;
      content: string;
      salary?: string;
      location?: string;
      startDate?: string;
      benefits?: string;
      positionTitle?: string;
      status: OfferMailStatus;
      counterLetter?: string;
      counterSentAt?: string;
      counterResponseStatus?: 'accepted' | 'rejected';
      signedOfferAvailable?: boolean;
      createdAt: string;
    }>;
    total: number;
  } {
    const data = result.data.map((m) => {
      const offerMailId = m.id ?? '';
      const latestCounter = offerMailId
        ? result.counterLettersByOfferMailId.get(offerMailId)
        : undefined;
      const legacyCounter =
        offerMailId && !latestCounter
          ? result.legacyEmbeddedCounters.get(offerMailId)
          : undefined;
      const counterLetter = latestCounter?.content ?? legacyCounter?.content;
      const counterSentAt = toIsoString(
        latestCounter?.createdAt ?? legacyCounter?.sentAt
      );
      const counterResponseStatus =
        latestCounter?.responseStatus === 'accepted' ||
        latestCounter?.responseStatus === 'rejected'
          ? latestCounter.responseStatus
          : undefined;
      const signedOfferAvailable =
        m.status === 'accepted' &&
        Boolean(m.docusignAcceptanceEnvelopeId?.trim());

      return {
        id: m.id,
        applicationId: m.applicationId,
        jobId: m.jobId,
        companyId: m.companyId,
        candidateUserId: m.candidateUserId,
        candidateName: m.candidateName,
        candidateEmail: m.candidateEmail,
        content: m.content,
        salary: m.status === 'counter' ? latestCounter?.salary ?? m.salary : m.salary,
        location: m.status === 'counter' ? latestCounter?.location ?? m.location : m.location,
        startDate: m.status === 'counter' ? latestCounter?.startDate ?? m.startDate : m.startDate,
        benefits: m.status === 'counter' ? latestCounter?.benefits ?? m.benefits : m.benefits,
        positionTitle:
          m.status === 'counter' ? latestCounter?.positionTitle ?? m.positionTitle : m.positionTitle,
        status: m.status,
        ...(counterLetter !== undefined && { counterLetter }),
        ...(counterSentAt !== undefined && { counterSentAt }),
        ...(counterResponseStatus !== undefined && { counterResponseStatus }),
        ...(signedOfferAvailable && { signedOfferAvailable: true }),
        createdAt: toIsoString(m.createdAt) || '',
      };
    });

    return { data, total: result.total };
  },

  toGetLatestInterviewerFeedbackInput(
    params: { jobId: string; applicationId: string },
    context: CallerContext
  ): IGetLatestInterviewerFeedbackInput {
    return {
      companyId: context.companyId || '',
      jobId: params.jobId,
      applicationId: params.applicationId,
    };
  },

  toRespondToCounterLetterInput(
    params: { offerMailId: string },
    body: { action: 'accept' | 'reject' },
    context: CallerContext
  ): IRespondToCounterLetterInput {
    return {
      offerMailId: params.offerMailId,
      companyId: context.companyId || '',
      action: body.action,
    };
  },

  toGetSignedOfferPdfInput(
    params: { offerMailId: string },
    context: CallerContext
  ): Extract<GetSignedOfferPdfRequest, { companyId: string }> {
    return {
      offerMailId: params.offerMailId,
      companyId: context.companyId || '',
    };
  },

  toCandidateGetSignedOfferPdfInput(
    params: { offerMailId: string },
    userId: string
  ): Extract<GetSignedOfferPdfRequest, { candidateUserId: string }> {
    return {
      offerMailId: params.offerMailId,
      candidateUserId: userId,
    };
  },

  toApplyForJobInput(
    params: { jobId: string },
    body: { useResumeFromProfile: boolean; coverLetter?: string; resumeUrl?: string },
    userId: string
  ): IApplyForJobInput {
    return {
      jobId: params.jobId,
      candidateUserId: userId,
      useResumeFromProfile: body.useResumeFromProfile,
      coverLetter: body.coverLetter,
      resumeUrl: body.resumeUrl,
    };
  },

  toListCandidateMailboxInput(
    query: {
      kind?: CandidateMailboxKind;
      jobId?: string;
      offerStatus?: OfferMailStatus;
      search?: string;
      page?: number;
      limit?: number;
    },
    userId: string
  ): {
    candidateUserId: string;
    kind?: CandidateMailboxKind;
    jobId?: string;
    offerStatus?: OfferMailStatus;
    search?: string;
    page?: number;
    limit?: number;
  } {
    return {
      candidateUserId: userId,
      kind: query.kind,
      jobId: query.jobId,
      offerStatus: query.offerStatus,
      search: query.search,
      page: query.page,
      limit: query.limit,
    };
  },

  toRespondToOfferInput(
    params: { offerMailId: string },
    userId: string
  ): {
    candidateUserId: string;
    offerMailId: string;
    action: 'decline';
  } {
    return {
      candidateUserId: userId,
      offerMailId: params.offerMailId,
      action: 'decline',
    };
  },

  toOfferSummaryView(offer: OfferMail): {
    offer: {
      id?: string | null;
      applicationId: string;
      jobId: string;
      companyId: string;
      status: OfferMailStatus;
      createdAt: string;
    };
  } {
    return {
      offer: {
        id: offer.id,
        applicationId: offer.applicationId,
        jobId: offer.jobId,
        companyId: offer.companyId,
        status: offer.status,
        createdAt: toIsoString(offer.createdAt) || '',
      },
    };
  },

  toSubmitOfferCounterInput(
    params: { offerMailId: string },
    body: {
      letter?: string;
      salary?: string;
      location?: string;
      startDate?: string;
      benefits?: string;
      positionTitle?: string;
    },
    userId: string
  ): {
    candidateUserId: string;
    offerMailId: string;
    letter: string;
    salary?: string;
    location?: string;
    startDate?: string;
    benefits?: string;
    positionTitle?: string;
  } {
    return {
      candidateUserId: userId,
      offerMailId: params.offerMailId,
      letter: body.letter ?? '',
      salary: body.salary,
      location: body.location,
      startDate: body.startDate,
      benefits: body.benefits,
      positionTitle: body.positionTitle,
    };
  },

  toSubmitOfferCounterView(result: ISubmitOfferCounterLetterResult): {
    offer: {
      id?: string | null;
      applicationId: string;
      jobId: string;
      companyId: string;
      candidateUserId: string;
      candidateName: string;
      candidateEmail: string;
      content: string;
      salary?: string;
      location?: string;
      startDate?: string;
      benefits?: string;
      positionTitle?: string;
      status: OfferMailStatus;
      counterLetter: string;
      counterSentAt: string;
      createdAt: string;
    };
  } {
    const offer = result.offer;
    const counter = result.counter;
    return {
      offer: {
        id: offer.id,
        applicationId: offer.applicationId,
        jobId: offer.jobId,
        companyId: offer.companyId,
        candidateUserId: offer.candidateUserId,
        candidateName: offer.candidateName,
        candidateEmail: offer.candidateEmail,
        content: offer.content,
        salary: offer.salary,
        location: offer.location,
        startDate: offer.startDate,
        benefits: offer.benefits,
        positionTitle: offer.positionTitle,
        status: offer.status,
        counterLetter: counter.content,
        counterSentAt: toIsoString(counter.createdAt) || '',
        createdAt: toIsoString(offer.createdAt) || '',
      },
    };
  },
};
