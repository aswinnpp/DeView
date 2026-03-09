import { api } from "../api/axios";
import { API_ROUTES } from "../constants/routes";

export interface CandidateInterviewHistoryItem {
  id: string;
  interviewId: string;
  companyName: string;
  interviewerName: string;
  feedback: string;
  totalScore: number;
  createdAt: string;
}

export const candidateInterviewHistoryService = {
  list: () =>
    api.get<{ success: true; data: CandidateInterviewHistoryItem[] }>(
      API_ROUTES.CANDIDATE.INTERVIEW_FEEDBACKS
    ),
};

