import { api } from "../api/axios";
import { API_ROUTES } from "../constants/routes";

export interface CompletedInterviewItem {
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
  createdAt: string;
  updatedAt: string;
}

type BackendInterview = {
  id?: string;
  _id?: { toString?: () => string };
  companyId?: string;
  companyName?: string;
  jobId?: string;
  jobTitle?: string;
  applicationId?: string;
  candidateUserId?: string;
  candidateName?: string;
  interviewerUserId?: string;
  interviewerName?: string;
  round?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

function fromBackendInterview(raw: BackendInterview): CompletedInterviewItem | null {
  if (!raw) return null;
  const id =
    raw.id ??
    (raw as { _id?: { toString?: () => string } })._id?.toString?.() ??
    "";

  if (!id) return null;

  return {
    id,
    companyId: String(raw.companyId ?? ""),
    companyName: String(raw.companyName ?? ""),
    jobId: String(raw.jobId ?? ""),
    jobTitle: String(raw.jobTitle ?? ""),
    applicationId: String(raw.applicationId ?? ""),
    candidateUserId: String(raw.candidateUserId ?? ""),
    candidateName: String(raw.candidateName ?? ""),
    interviewerUserId: String(raw.interviewerUserId ?? ""),
    interviewerName: String(raw.interviewerName ?? ""),
    round: String(raw.round ?? ""),
    scheduledDate: String(raw.scheduledDate ?? ""),
    scheduledTime: String(raw.scheduledTime ?? ""),
    status: String(raw.status ?? ""),
    createdAt: String(raw.createdAt ?? ""),
    updatedAt: String(raw.updatedAt ?? ""),
  };
}

export interface ListCompletedParams {
  search?: string;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface ListCompletedResult {
  data: CompletedInterviewItem[];
  total: number;
}

export const interviewerCompletedInterviewsService = {
  list: (params?: ListCompletedParams) =>
    api
      .get(API_ROUTES.INTERVIEWER.COMPLETED, {
        params: {
          search: params?.search?.trim() || undefined,
          page: params?.page,
          limit: params?.limit,
          sortOrder: params?.sortOrder,
        },
      })
      .then((res) => {
        const body = res.data as { data?: BackendInterview[]; total?: number };
        const arr: BackendInterview[] = Array.isArray(body?.data) ? body.data : [];
        const total = typeof body?.total === 'number' ? body.total : arr.length;
        const data = arr.map((item) => fromBackendInterview(item)).filter((x): x is CompletedInterviewItem => Boolean(x));
        return { data, total };
      }),

  submitFeedback: (interviewId: string, payload: { totalScore: number; feedback: string }) =>
    api
      .post(API_ROUTES.INTERVIEWER.SUBMIT_FEEDBACK(interviewId), payload)
      .then((res) => res.data),
};

