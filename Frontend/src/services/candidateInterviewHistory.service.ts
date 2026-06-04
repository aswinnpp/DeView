import { api } from "../api/axios";
import { API_ROUTES } from "../constants/routes";

export interface CandidateInterviewHistoryItem {
  id: string;
  interviewId: string;
  companyName: string;
  interviewerName: string;
  jobId: string;
  round: string;
  interviewType?: "ONLINE" | "CALL" | "F2F";
  interviewLocation?: string;
  feedback: string;
  totalScore: number;
  createdAt: string;
}

export interface ListInterviewHistoryParams {
  search?: string;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface ListInterviewHistoryResult {
  data: CandidateInterviewHistoryItem[];
  total: number;
}

export const candidateInterviewHistoryService = {
  list: (params?: ListInterviewHistoryParams) =>
    api
      .get<{ data: CandidateInterviewHistoryItem[]; total: number }>(
        API_ROUTES.CANDIDATE.INTERVIEW_FEEDBACKS,
        {
          params: {
            search: params?.search?.trim() || undefined,
            page: params?.page,
            limit: params?.limit,
            sortOrder: params?.sortOrder,
          },
        }
      )
      .then((res) => ({
        data: res.data?.data ?? [],
        total: res.data?.total ?? 0,
      })),
};

