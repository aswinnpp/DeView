import { api } from "../api/axios";
import { API_ROUTES } from "../constants/routes";

export interface InterviewerAssignmentItem {
  id: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  interviewRound: string;
  interviewType?: "ONLINE" | "CALL" | "F2F";
  interviewLocation?: string;
  status: string;
  interviewerAccepted?: boolean;
}

function fromBackendInterview(raw: {
  id?: string;
  _id?: string;
  jobTitle?: string;
  candidateName?: string;
  candidateUserId?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  interviewType?: "ONLINE" | "CALL" | "F2F";
  interviewLocation?: string;
  round?: string;
  status?: string;
  interviewerAccepted?: boolean;
  interviewerRejectReason?: string;
  createdAt?: string;
  updatedAt?: string;
}): InterviewerAssignmentItem {
  const id = raw.id ?? (raw as { _id?: { toString?: () => string } })._id?.toString?.() ?? "";
  const status = raw.status ?? "SCHEDULED";
  const accepted = raw.interviewerAccepted ?? false;
  const rejected = Boolean((raw as { interviewerRejectReason?: string }).interviewerRejectReason);
  const assignmentStatus = accepted
    ? "accepted"
    : rejected
      ? "rejected"
      : status === "COMPLETED"
        ? "completed"
        : status === "CANCELLED"
          ? "cancelled"
          : "pending";
  return {
    id,
    jobTitle: raw.jobTitle ?? "",
    candidateName: raw.candidateName ?? "",
    candidateEmail: "", // backend Interview entity doesn't have email
    date: raw.scheduledDate ?? "",
    startTime: raw.scheduledTime ?? "",
    endTime: raw.scheduledTime ?? "",
    interviewRound: raw.round ?? "",
    interviewType: raw.interviewType ?? "ONLINE",
    interviewLocation: raw.interviewLocation,
    status: assignmentStatus,
    interviewerAccepted: accepted,
  };
}

export interface ListAssignmentsParams {
  search?: string;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
  acceptedOnly?: boolean;
}

export interface ListAssignmentsResult {
  data: InterviewerAssignmentItem[];
  total: number;
}

export const interviewerAssignmentsService = {
  list: (params?: ListAssignmentsParams) =>
    api
      .get(API_ROUTES.INTERVIEWER.ASSIGNMENTS, {
        params: {
          search: params?.search?.trim() || undefined,
          page: params?.page,
          limit: params?.limit,
          sortOrder: params?.sortOrder,
          acceptedOnly: params?.acceptedOnly,
        },
      })
      .then((res) => {
        const body = res.data as { data?: unknown[]; total?: number };
        const arr = Array.isArray(body?.data) ? body.data : [];
        const total = typeof body?.total === 'number' ? body.total : arr.length;
        const data = arr.map((item) => fromBackendInterview(item as Parameters<typeof fromBackendInterview>[0]));
        return { data, total };
      }),

  getResumeViewUrl: async (interviewId: string): Promise<string> => {
    const res = await api.get<{ url?: string }>(
      API_ROUTES.INTERVIEWER.ASSIGNMENT_RESUME_VIEW_URL(interviewId)
    );
    const url = (res.data as { url?: string })?.url;
    if (!url) throw new Error("No resume URL returned");
    return url;
  },

  accept: (interviewId: string) =>
    api.patch<{ data?: unknown }>(API_ROUTES.INTERVIEWER.ACCEPT(interviewId)).then((res) => res.data),

  reject: (interviewId: string, reason: string) =>
    api.patch<{ data?: unknown }>(API_ROUTES.INTERVIEWER.REJECT(interviewId), { reason }).then((res) => res.data),
};
