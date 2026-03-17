import type { Application } from '../../../../domain/application/entities/Application.js';
import type { ApplicationStatus } from '../../../../domain/application/entities/Application.js';

export interface IApplicationRepository {
  listByJobId(
    jobId: string,
    companyId: string,
    status?: ApplicationStatus | ApplicationStatus[]
  ): Promise<Application[]>;

  countByJobId(jobId: string, companyId: string): Promise<Record<ApplicationStatus, number>>;

  listPendingByJobId(jobId: string, companyId: string): Promise<Application[]>;

  listByCandidateUserId(
    candidateUserId: string,
    options?: {
      status?: ApplicationStatus;
      search?: string;
      page?: number;
      limit?: number;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<{ data: Application[]; total: number }>;

  findByIdAndJobId(applicationId: string, jobId: string, companyId: string): Promise<Application | null>;

  updateAiScores(
    jobId: string,
    companyId: string,
    updates: Array<{ applicationId: string; aiScore: number }>
  ): Promise<void>;

  updateStatus(input: {
    applicationId: string;
    jobId: string;
    companyId: string;
    status: ApplicationStatus;
    rejectionEmailContent?: string;
  }): Promise<Application | null>;

  addCompletedRound(input: {
    applicationId: string;
    jobId: string;
    companyId: string;
    round: string;
  }): Promise<Application | null>;

  scheduleInterview(input: {
    applicationId: string;
    jobId: string;
    companyId: string;
    roundDetails: {
      round: string;
      interviewer: string;
      interviewerEmail?: string;
      scheduledDate: string;
      scheduledTime: string;
    };
    /** If provided, update existing round; else add new round */
    isReschedule?: boolean;
  }): Promise<Application | null>;

  setRescheduleRequest(input: {
    applicationId: string;
    jobId: string;
    companyId: string;
    rescheduleRequest: {
      originalDate: string;
      originalTime: string;
      requestedDate: string;
      requestedTime: string;
      reason: string;
      requestedAt: Date;
    };
  }): Promise<Application | null>;

  updateInterviewFeedback(input: {
    applicationId: string;
    jobId: string;
    companyId: string;
    round: string;
    feedback: string;
    totalScore: number;
  }): Promise<Application | null>;
}
