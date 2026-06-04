/** Interview mutations (status, feedback, assignments, reschedule) — input + output in one module. */

import type { Interview, InterviewStatus } from '../../../domain/entities/Interview.js';

export interface IUpdateInterviewStatusInputDTO {
  interviewId: string;
  interviewerUserId: string;
  status: InterviewStatus;
}

export type IUpdateInterviewStatusOutputDTO = void;

export interface ISaveInterviewFeedbackInputDTO {
  interviewId: string;
  interviewerUserId: string;
  totalScore: number;
  feedback: string;
}

export interface ISaveInterviewFeedbackOutputDTO {
  success: boolean;
}

export interface IAcceptInterviewAssignmentInputDTO {
  interviewId: string;
  interviewerUserId: string;
}

export interface IAcceptInterviewAssignmentOutputDTO {
  data: Interview | null;
}

export interface IRejectInterviewAssignmentInputDTO {
  interviewId: string;
  interviewerUserId: string;
  reason: string;
}

export interface IRejectInterviewAssignmentOutputDTO {
  data: Interview | null;
}

export interface IRequestCandidateRescheduleInputDTO {
  interviewId: string;
  candidateUserId: string;
  requestedDate: string;
  reason: string;
}

export interface IRequestCandidateRescheduleOutputDTO {
  interview: Interview;
}
