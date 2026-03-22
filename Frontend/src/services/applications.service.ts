import { api } from "../api/axios";
import { API_ROUTES } from "../constants/routes";

export interface ApplicationItem {
  id: string;
  jobId: string;
  companyId: string;
  candidateUserId: string;
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  title?: string;
  currentCompany?: string;
  experience?: string;
  bio?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  preferredWorkMode?: string;
  preferredJobType?: string;
  skills: string[];
  education?: string;
  university?: string;
  graduationYear?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  resumeUrl: string;
  coverLetter?: string;
  status:
    | "PENDING"
    | "SHORTLISTED"
    | "INTERVIEW_SCHEDULED"
    | "INTERVIEW_COMPLETE"
    | "COMPLETED"
    | "HIRED"
    | "REJECTED"
    | "RESCHEDULE_REQUESTED";
  aiScore?: number;
  interviewDetails?: {
    round: string;
    interviewer: string;
    interviewerEmail?: string;
    scheduledDate: string;
    scheduledTime: string;
    feedback?: string;
    totalScore?: number;
  };
  interviewRounds?: Array<{
    round: string;
    interviewer: string;
    interviewerEmail?: string;
    scheduledDate: string;
    scheduledTime: string;
    feedback?: string;
    totalScore?: number;
  }>;
  rescheduleRequest?: {
    originalDate: string;
    originalTime: string;
    requestedDate: string;
    requestedTime: string;
    reason: string;
    requestedAt: string;
  };
  completedRounds?: string[];
  rejectionEmailContent?: string;
  rejectionSentAt?: string;
  offerEmailContent?: string;
  offerSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type CandidatePipelineTab =
  | "pending"
  | "shortlist"
  | "interview"
  | "interview_complete"
  | "complete";

export type ApplicationCounts = Record<CandidatePipelineTab, number>;

export interface JobApplicantDoc {
  applicationId: string;
  candidateUserId: string;
  fullName: string;
  email: string;
  status: string;
  appliedAt: string;
}

export interface JobListItem {
  id: string;
  companyId: string;
  title: string;
  department: string;
  location: string;
  jobType: string;
  salary?: string;
  status: string;
  interviewRounds?: string[];
  applicants?: JobApplicantDoc[];
  createdAt: string;
  updatedAt: string;
}

function toJobsResult(data: unknown): { data: JobListItem[]; total: number } {
  if (data && typeof data === "object" && "data" in data && "total" in data) {
    const obj = data as { data?: unknown; total?: unknown };
    return {
      data: Array.isArray(obj.data) ? obj.data : [],
      total: typeof obj.total === "number" && obj.total >= 0 ? obj.total : 0,
    };
  }
  const wrapped = (data as { data?: JobListItem[] })?.data;
  const arr = Array.isArray(wrapped) ? wrapped : [];
  return { data: arr, total: arr.length };
}

function toApplicationsResult(data: unknown): ApplicationItem[] {
  if (data && typeof data === "object" && "data" in data) {
    const obj = data as { data?: unknown };
    return Array.isArray(obj.data) ? obj.data : [];
  }
  return [];
}

function toApplicationsCounts(data: unknown): ApplicationCounts {
  const empty: ApplicationCounts = {
    pending: 0,
    shortlist: 0,
    interview: 0,
    interview_complete: 0,
    complete: 0,
  };
  if (!data || typeof data !== "object" || !("counts" in data)) return empty;
  const counts = (data as { counts?: unknown }).counts;
  if (!counts || typeof counts !== "object") return empty;
  const c = counts as Partial<Record<CandidatePipelineTab, unknown>>;
  return {
    pending: typeof c.pending === "number" ? c.pending : 0,
    shortlist: typeof c.shortlist === "number" ? c.shortlist : 0,
    interview: typeof c.interview === "number" ? c.interview : 0,
    interview_complete: typeof c.interview_complete === "number" ? c.interview_complete : 0,
    complete: typeof c.complete === "number" ? c.complete : 0,
  };
}

export const applicationsService = {
  listJobs: (params?: { search?: string; status?: "OPEN" | "CLOSED"; page?: number; limit?: number }) =>
    api
      .get<{ data: JobListItem[]; total: number }>(API_ROUTES.APPLICATIONS.JOBS_LIST, {
        params: {
          search: params?.search,
          status: params?.status,
          page: params?.page,
          limit: params?.limit ?? 100,
        },
      })
      .then((res) => toJobsResult(res.data)),

  listApplications: (
    jobId: string,
    params?: {
      status?:
        | "PENDING"
        | "SHORTLISTED"
        | "INTERVIEW_SCHEDULED"
        | "INTERVIEW_COMPLETE"
        | "COMPLETED"
        | "HIRED"
        | "REJECTED"
        | "RESCHEDULE_REQUESTED";
      pipelineTab?: CandidatePipelineTab;
    }
  ) =>
    api
      .get<{ data: ApplicationItem[] }>(API_ROUTES.APPLICATIONS.PENDING_APPLICATIONS(jobId), {
        params:
          params?.pipelineTab || params?.status
            ? { pipelineTab: params.pipelineTab, status: params.status }
            : undefined,
      })
      .then((res) => ({
        data: toApplicationsResult(res.data),
        counts: toApplicationsCounts(res.data),
      })),

  getResumeViewUrl: async (jobId: string, applicationId: string): Promise<string> => {
    const res = await api.get<{ url?: string }>(
      API_ROUTES.APPLICATIONS.RESUME_VIEW_URL(jobId, applicationId)
    );
    const url = (res.data as { url?: string })?.url;
    if (!url) throw new Error("No resume URL returned");
    return url;
  },

  getLatestInterviewerFeedback: async (
    jobId: string,
    applicationId: string
  ): Promise<{
    interviewerName: string;
    jobId: string;
    round: string;
    totalScore: number;
    feedback: string;
    createdAt: string;
  }> => {
    const res = await api.get<{
      data?: {
        interviewerName: string;
        jobId: string;
        round: string;
        totalScore: number;
        feedback: string;
        createdAt: string;
      };
    }>(
      API_ROUTES.APPLICATIONS.LATEST_INTERVIEWER_FEEDBACK(jobId, applicationId)
    );
    const d = (res.data as {
      data?: {
        interviewerName: string;
        jobId: string;
        round: string;
        totalScore: number;
        feedback: string;
        createdAt: string;
      };
    })?.data;
    if (!d) throw new Error("No feedback returned");
    return d;
  },

  /** Score candidates against job using AI. Returns scores per applicationId. */
  scoreCandidates: async (
    jobId: string,
    candidates: Array<{
      id: string;
      name: string;
      email?: string;
      phone?: string;
      location?: string;
      experience?: string;
      education?: string;
      skills?: string;
      coverLetter?: string | null;
      bio?: string;
      title?: string;
      currentCompany?: string;
      expectedSalary?: string;
      noticePeriod?: string;
      preferredWorkMode?: string;
      preferredJobType?: string;
      university?: string;
      graduationYear?: string;
      linkedinUrl?: string;
      githubUrl?: string;
    }>
  ): Promise<{ scores: Array<{ applicationId: string; matchScore: number }> }> => {
    const payload = candidates.map((c) => ({
      applicationId: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      location: c.location,
      experience: c.experience,
      education: c.education,
      skills: c.skills,
      coverLetter: c.coverLetter ?? undefined,
      bio: c.bio,
      title: c.title,
      currentCompany: c.currentCompany,
      expectedSalary: c.expectedSalary,
      noticePeriod: c.noticePeriod,
      preferredWorkMode: c.preferredWorkMode,
      preferredJobType: c.preferredJobType,
      university: c.university,
      graduationYear: c.graduationYear,
      linkedinUrl: c.linkedinUrl,
      githubUrl: c.githubUrl,
    }));
    const res = await api.post<{ scores: Array<{ applicationId: string; matchScore: number }> }>(
      API_ROUTES.APPLICATIONS.SCORE_CANDIDATES(jobId),
      { candidates: payload }
    );
    return res.data as { scores: Array<{ applicationId: string; matchScore: number }> };
  },

  /** Update status (and optional rejection / offer email content) for a single application. */
  updateApplicationStatus: async (
    jobId: string,
    applicationId: string,
    payload: {
      status:
        | "PENDING"
        | "SHORTLISTED"
        | "INTERVIEW_SCHEDULED"
        | "INTERVIEW_COMPLETE"
        | "COMPLETED"
        | "HIRED"
        | "REJECTED"
        | "RESCHEDULE_REQUESTED";
      rejectionEmailContent?: string;
      offerEmailContent?: string;
      offerSalary?: string;
      offerLocation?: string;
      offerStartDate?: string;
      offerBenefits?: string;
    }
  ): Promise<void> => {
    await api.put(
      API_ROUTES.APPLICATIONS.UPDATE_STATUS(jobId, applicationId),
      payload
    );
  },

  respondToCounterLetter: async (
    offerMailId: string,
    action: "accept" | "reject"
  ): Promise<void> => {
    await api.post(API_ROUTES.APPLICATIONS.COUNTER_RESPOND(offerMailId), { action });
  },

  listOfferMails: async (): Promise<
    Array<{
      id: string | null;
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
      status: "pending" | "accepted" | "declined" | "counter";
      counterLetter?: string;
      counterSentAt?: string;
      counterResponseStatus?: "accepted" | "rejected";
      signedOfferAvailable?: boolean;
      createdAt: string;
    }>
  > => {
    const res = await api.get<{ data?: unknown }>(API_ROUTES.APPLICATIONS.OFFER_MAILS);
    const raw = (res.data as { data?: unknown })?.data;
    if (!Array.isArray(raw)) return [];
    return raw as Array<{
      id: string | null;
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
      status: "pending" | "accepted" | "declined" | "counter";
      counterLetter?: string;
      counterSentAt?: string;
      counterResponseStatus?: "accepted" | "rejected";
      signedOfferAvailable?: boolean;
      createdAt: string;
    }>;
  },

  fetchOfferSignedPdf: async (offerMailId: string): Promise<Blob> => {
    const res = await api.get(API_ROUTES.APPLICATIONS.OFFER_SIGNED_PDF(offerMailId), {
      responseType: "blob",
    });
    return res.data as Blob;
  },

  /** Schedule an interview for a single application. */
  scheduleInterview: async (
    jobId: string,
    applicationId: string,
    payload: {
      round: string;
      interviewerUserId: string;
      interviewerName: string;
      interviewerEmail?: string;
      scheduledDate: string;
      scheduledTime: string;
      slotStartIso?: string;
    }
  ): Promise<ApplicationItem> => {
    const res = await api.post<{ application?: ApplicationItem }>(
      API_ROUTES.APPLICATIONS.SCHEDULE_INTERVIEW(jobId, applicationId),
      payload
    );
    const app = (res.data as { application?: ApplicationItem })?.application;
    if (!app) throw new Error("No application returned");
    return app;
  },

  precheckScheduleInterview: async (
    jobId: string,
    applicationId: string,
    params?: { scheduledDate?: string }
  ): Promise<void> => {
    await api.get(API_ROUTES.APPLICATIONS.INTERVIEW_PRECHECK(jobId, applicationId), {
      params: { scheduledDate: params?.scheduledDate },
    });
  },

  /** Decline a candidate reschedule request (keeps original schedule). */
  declineRescheduleRequest: async (jobId: string, applicationId: string): Promise<void> => {
    await api.patch(API_ROUTES.APPLICATIONS.DECLINE_RESCHEDULE(jobId, applicationId));
  },
};
