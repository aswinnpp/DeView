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

/** Serialized interview row for interviewer “manage” list, including latest feedback snapshot. */
export interface ICompletedInterviewForInterviewerListItemDTO {
  id: string;
  companyId: string;
  companyName: string;
  jobId: string;
  jobTitle: string;
  roomName: string;
  applicationId: string;
  candidateUserId: string;
  candidateName: string;
  interviewerUserId: string;
  interviewerName: string;
  round: string;
  scheduledDate: string;
  scheduledTime: string;
  interviewType: 'ONLINE' | 'CALL' | 'F2F';
  interviewLocation?: string;
  status: string;
  feedbackSubmitted: boolean;
  interviewerAccepted: boolean;
  interviewerRejectReason?: string;
  candidateRejection?: { date: string; reason: string };
  candidateRejectionStatus?: 'PENDING' | 'DECLINED';
  createdAt: string;
  updatedAt: string;
  latestFeedback: string | null;
  latestTotalScore: number | null;
}

export interface IListCompletedInterviewsForInterviewerOutputDTO {
  data: ICompletedInterviewForInterviewerListItemDTO[];
  total: number;
}

export interface ICandidateInterviewHistoryItemDTO {
  id: string;
  interviewId: string;
  companyName: string;
  interviewerName: string;
  jobId: string;
  round: string;
  interviewType?: 'ONLINE' | 'CALL' | 'F2F';
  interviewLocation?: string;
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
