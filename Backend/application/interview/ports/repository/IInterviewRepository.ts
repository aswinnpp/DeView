import type { Interview, InterviewStatus } from '../../../../domain/interview/entities/Interview.js';

export interface ListByCandidateUserIdOptions {
  search?: string;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface IInterviewRepository {
  create(interview: Interview): Promise<Interview>;
  countByCandidateUserIdAndScheduledDate(
    candidateUserId: string,
    scheduledDate: string,
    options?: { excludeInterviewId?: string }
  ): Promise<number>;
  countByStatus(): Promise<number>;
  listByCandidateUserId(
    candidateUserId: string,
    options?: ListByCandidateUserIdOptions
  ): Promise<{ data: Interview[]; total: number }>;
  listByInterviewerUserId(
    interviewerUserId: string,
    options?: { search?: string; page?: number; limit?: number; sortOrder?: 'asc' | 'desc'; acceptedOnly?: boolean }
  ): Promise<{ data: Interview[]; total: number }>;
  listCompletedByInterviewerUserId(
    interviewerUserId: string,
    options?: { search?: string; page?: number; limit?: number; sortOrder?: 'asc' | 'desc' }
  ): Promise<{ data: Interview[]; total: number }>;
  listByCompanyId(companyId: string): Promise<Interview[]>;
  findById(id: string): Promise<Interview | null>;
  findActiveByApplicationId(applicationId: string): Promise<Interview | null>;
  findLatestCompletedByApplicationId(applicationId: string): Promise<Interview | null>;
  setInterviewerAccepted(id: string, accepted: boolean, rejectReason?: string): Promise<Interview | null>;
  setCandidateRejection(id: string, input: { date: string; reason: string }): Promise<Interview | null>;
  declineCandidateRejection(id: string): Promise<Interview | null>;
  rescheduleFromCompany(id: string, input: { scheduledDate: string; scheduledTime: string; interviewerUserId: string; interviewerName: string; round: string }): Promise<Interview | null>;
  updateStatus(id: string, status: InterviewStatus): Promise<Interview | null>;
  setFeedbackSubmitted(id: string, submitted: boolean): Promise<Interview | null>;
}

