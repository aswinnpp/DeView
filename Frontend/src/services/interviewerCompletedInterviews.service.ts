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

export const interviewerCompletedInterviewsService = {
  list: () =>
    api
      .get<CompletedInterviewItem[] | { data?: unknown }>(
        API_ROUTES.INTERVIEWER.COMPLETED
      )
      .then((res) => {
        const body = res.data as unknown;
        const arr: BackendInterview[] = Array.isArray(body)
          ? (body as BackendInterview[])
          : Array.isArray((body as { data?: unknown }).data)
          ? (((body as { data?: unknown }).data as BackendInterview[]) || [])
          : [];
        return arr.map((item) => fromBackendInterview(item)).filter((x): x is CompletedInterviewItem => Boolean(x));
      }),

  submitFeedback: (interviewId: string, payload: { totalScore: number; feedback: string }) =>
    api
      .post(API_ROUTES.INTERVIEWER.SUBMIT_FEEDBACK(interviewId), payload)
      .then((res) => res.data),
};

