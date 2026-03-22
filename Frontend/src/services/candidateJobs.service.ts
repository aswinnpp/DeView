import { api } from "../api/axios";
import { API_ROUTES } from "../constants/routes";
import type { ApplicationItem } from "./applications.service";

export interface JobApplicantDetail {
  applicationId: string;
  candidateUserId: string;
  fullName: string;
  email: string;
  status: string;
  appliedAt: string;
}

export interface CandidateJob {
  id: string;
  companyId: string;
  companyName?: string;
  companyApprovalStatus?: string;
  companyIsActive?: boolean;
  title: string;
  department: string;
  location: string;
  jobType: string;
  workMode: string;
  experienceLevel: string;
  minExperience?: string;
  maxExperience?: string;
  salary?: string;
  salaryNonDisclosure: boolean;
  skills: string;
  qualifications: string;
  responsibilities: string;
  benefits?: string;
  description: string;
  applicationDeadline?: string;
  numberOfPositions: number;
  interviewRounds: string[];
  status: string;
  applicants: JobApplicantDetail[];
  createdAt: string;
  updatedAt: string;
}

function toPaginatedResult(data: unknown): { data: CandidateJob[]; total: number } {
  if (data && typeof data === "object" && "data" in data && "total" in data) {
    const obj = data as { data?: unknown; total?: unknown };
    return {
      data: Array.isArray(obj.data) ? (obj.data as CandidateJob[]) : [],
      total: typeof obj.total === "number" && obj.total >= 0 ? obj.total : 0,
    };
  }
  const wrapped = (data as { data?: CandidateJob[] })?.data;
  const arr = Array.isArray(wrapped) ? wrapped : [];
  return { data: arr, total: arr.length };
}

export interface CandidateJobListParams {
  search?: string;
  status?: "OPEN" | "CLOSED" | "all";
  jobType?: string;
  page?: number;
  limit?: number;
  sortBy?: "date" | "salary" | "title";
  sortOrder?: "asc" | "desc";
}

export interface ApplyForJobParams {
  useResumeFromProfile: boolean;
  coverLetter?: string;
  resumeUrl?: string;
}

export type OfferMailboxStatus = "pending" | "accepted" | "declined" | "counter";

export interface CandidateMailboxOfferRow {
  id: string | null;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  content: string;
  salary?: string;
  location?: string;
  startDate?: string;
  benefits?: string;
  status: OfferMailboxStatus;
  counterLetter?: string;
  counterSentAt?: string;
  /** Company response to candidate counter (accepted | rejected). */
  counterResponseStatus?: "accepted" | "rejected";
  /** DocuSign combined PDF available (accepted + envelope id). */
  signedOfferAvailable?: boolean;
  createdAt: string;
}

export interface CandidateMailboxData {
  offers: CandidateMailboxOfferRow[];
  rejections: Array<{
    id: string | null;
    applicationId: string;
    jobId: string;
    jobTitle: string;
    companyName: string;
    content: string;
    createdAt: string;
  }>;
}

export interface MyApplicationsParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortOrder?: "asc" | "desc";
}

export interface InterviewItem {
  id: string;
  companyId: string;
  companyName: string;
  jobId: string;
  jobTitle: string;
  applicationId: string;
  candidateUserId: string;
  candidateName: string;
  interviewerUserId: string;
  interviewerName: string;
  round: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  candidateRejection?: { date: string; reason: string };
  candidateRejectionStatus?: "PENDING" | "DECLINED";
  createdAt: string;
  updatedAt: string;
}

function toMyApplicationsResult(data: unknown): { data: ApplicationItem[]; total: number } {
  if (!data || typeof data !== "object" || !("data" in data)) {
    return { data: [], total: 0 };
  }
  const obj = data as { data?: unknown; total?: unknown };
  const items = Array.isArray(obj.data) ? (obj.data as ApplicationItem[]) : [];
  const total = typeof obj.total === "number" && obj.total >= 0 ? obj.total : items.length;
  return { data: items, total };
}

export const candidateJobsService = {
  apply: (jobId: string, params: ApplyForJobParams) =>
    api.post<{ applicationId: string }>(API_ROUTES.CANDIDATE.APPLY(jobId), params),

  listAll: (params?: CandidateJobListParams) =>
    api
      .get<{ data: CandidateJob[]; total: number }>(API_ROUTES.CANDIDATE.JOBS, {
        params: {
          search: params?.search || undefined,
          status:
            params?.status && params.status !== "all"
              ? (params.status as "OPEN" | "CLOSED")
              : undefined,
          jobType: params?.jobType && params.jobType !== "all" ? params.jobType : undefined,
          page: params?.page,
          limit: params?.limit,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
      })
      .then((res) => toPaginatedResult(res.data)),

  listMailbox: async (): Promise<CandidateMailboxData> => {
    const res = await api.get<CandidateMailboxData>(API_ROUTES.CANDIDATE.MAILBOX);
    const body = res.data;
    if (body && typeof body === "object" && "offers" in body && "rejections" in body) {
      const offersRaw = Array.isArray(body.offers) ? body.offers : [];
      return {
        offers: offersRaw.map((o) => ({
          ...o,
          status:
            o.status === "accepted" ||
            o.status === "declined" ||
            o.status === "pending" ||
            o.status === "counter"
              ? o.status
              : "pending",
          signedOfferAvailable: Boolean(o.signedOfferAvailable),
        })),
        rejections: Array.isArray(body.rejections) ? body.rejections : [],
      };
    }
    return { offers: [], rejections: [] };
  },

  submitOfferCounter: async (offerMailId: string, letter: string): Promise<void> => {
    await api.post(API_ROUTES.CANDIDATE.OFFER_COUNTER(offerMailId), { letter });
  },

  respondToOffer: async (offerMailId: string, action: "decline"): Promise<void> => {
    await api.post(API_ROUTES.CANDIDATE.OFFER_RESPOND(offerMailId), { action });
  },

  beginOfferSigning: async (
    offerMailId: string
  ): Promise<
    | { outcome: "sign"; signingUrl: string }
    | { outcome: "accepted" }
    | { outcome: "consent_required" }
  > => {
    const res = await api.post<
      | { outcome: "sign"; signingUrl: string }
      | { outcome: "accepted" }
      | { outcome: "consent_required" }
    >(API_ROUTES.CANDIDATE.OFFER_SIGNING_BEGIN(offerMailId));
    return res.data as
      | { outcome: "sign"; signingUrl: string }
      | { outcome: "accepted" }
      | { outcome: "consent_required" };
  },

  confirmOfferSigning: async (offerMailId: string): Promise<void> => {
    await api.post(API_ROUTES.CANDIDATE.OFFER_SIGNING_CONFIRM(offerMailId));
  },

  fetchOfferSignedPdf: async (offerMailId: string): Promise<Blob> => {
    const res = await api.get(API_ROUTES.CANDIDATE.OFFER_SIGNED_PDF(offerMailId), {
      responseType: "blob",
    });
    return res.data as Blob;
  },

  listMyApplications: (params?: MyApplicationsParams) =>
    api
      .get(API_ROUTES.CANDIDATE.MY_APPLICATIONS, {
        params: {
          status: params?.status && params.status !== "all" ? params.status : undefined,
          search: params?.search?.trim() || undefined,
          page: params?.page,
          limit: params?.limit,
          sortOrder: params?.sortOrder,
        },
      })
      .then((res) => toMyApplicationsResult(res.data)),

  listMyInterviews: (params?: { search?: string; page?: number; limit?: number; sortOrder?: 'asc' | 'desc' }) =>
    api
      .get<{ data: InterviewItem[]; total: number }>(API_ROUTES.CANDIDATE.MY_INTERVIEWS, {
        params: {
          search: params?.search?.trim() || undefined,
          page: params?.page,
          limit: params?.limit,
          sortOrder: params?.sortOrder,
        },
      })
      .then((res) => {
        const body = res.data;
        if (body && typeof body === "object" && "data" in body && "total" in body) {
          return { data: (body.data ?? []) as InterviewItem[], total: (body.total as number) ?? 0 };
        }
        return { data: [], total: 0 };
      }),

  requestInterviewReschedule: (interviewId: string, payload: { requestedDate: string; reason: string }) =>
    api
      .patch(API_ROUTES.CANDIDATE.REQUEST_RESCHEDULE(interviewId), payload)
      .then((res) => res.data),
};
