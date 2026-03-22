/** Paginated interview lists + candidate feedback history — input + output in one module. */

import type { Interview } from '../../../domain/entities/Interview.js';

export interface IListMyInterviewsInputDTO {
  candidateUserId: string;
  search?: string;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface IListMyInterviewsOutputDTO {
  data: Interview[];
  total: number;
}

export interface IListInterviewerAssignmentsInputDTO {
  interviewerUserId: string;
  search?: string;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
  acceptedOnly?: boolean;
}

export interface IListInterviewerAssignmentsOutputDTO {
  data: Interview[];
  total: number;
}

export interface IListCompletedInterviewsForInterviewerInputDTO {
  interviewerUserId: string;
  search?: string;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface IListCompletedInterviewsForInterviewerOutputDTO {
  data: Interview[];
  total: number;
}

export interface ICandidateInterviewHistoryItemDTO {
  id: string;
  interviewId: string;
  companyName: string;
  interviewerName: string;
  jobId: string;
  round: string;
  feedback: string;
  totalScore: number;
  createdAt: string;
}

export interface IListMyInterviewFeedbacksInputDTO {
  candidateUserId: string;
  search?: string;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface IListMyInterviewFeedbacksOutputDTO {
  data: ICandidateInterviewHistoryItemDTO[];
  total: number;
}
