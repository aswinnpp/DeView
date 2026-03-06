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
    status: assignmentStatus,
    interviewerAccepted: accepted,
  };
}

export const interviewerAssignmentsService = {
  list: () =>
    api.get(API_ROUTES.INTERVIEWER.ASSIGNMENTS).then((res) => {
      const data = res.data as unknown;
      const arr = Array.isArray(data) ? data : (data as { data?: unknown[] })?.data;
      return Array.isArray(arr) ? arr.map((item) => fromBackendInterview(item as Parameters<typeof fromBackendInterview>[0])) : [];
    }),

  accept: (interviewId: string) =>
    api.post<{ data?: unknown }>(API_ROUTES.INTERVIEWER.ACCEPT(interviewId)).then((res) => res.data),

  reject: (interviewId: string, reason: string) =>
    api.post<{ data?: unknown }>(API_ROUTES.INTERVIEWER.REJECT(interviewId), { reason }).then((res) => res.data),
};
