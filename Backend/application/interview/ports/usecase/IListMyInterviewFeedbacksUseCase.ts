export interface ICandidateInterviewHistoryItem {
  id: string;
  interviewId: string;
  companyName: string;
  interviewerName: string;
  feedback: string;
  totalScore: number;
  createdAt: string;
}

export interface IListMyInterviewFeedbacksInput {
  candidateUserId: string;
  search?: string;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface IListMyInterviewFeedbacksUseCase {
  execute(input: IListMyInterviewFeedbacksInput): Promise<{ data: ICandidateInterviewHistoryItem[]; total: number }>;
}

