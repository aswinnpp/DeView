import type { Application } from '../../../../domain/application/entities/Application.js';
import type { ApplicationStatus } from '../../../../domain/application/entities/Application.js';

/** Repository for company/HR and candidates to list and manage applications. */
export interface IApplicationRepository {
  /** List applications for a job, scoped by companyId. Optional status filter. */
  listByJobId(jobId: string, companyId: string, status?: ApplicationStatus): Promise<Application[]>;

  /** @deprecated Use listByJobId with status 'PENDING'. */
  listPendingByJobId(jobId: string, companyId: string): Promise<Application[]>;

  /** List all applications for a candidate (used in candidate portal "My applications"). */
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

  /** Get one application by id, jobId and companyId (for resume view URL). */
  findByIdAndJobId(applicationId: string, jobId: string, companyId: string): Promise<Application | null>;

  /** Update aiScore for multiple applications. */
  updateAiScores(
    jobId: string,
    companyId: string,
    updates: Array<{ applicationId: string; aiScore: number }>
  ): Promise<void>;

  /** Update status (and optional rejection details) for a single application. */
  updateStatus(input: {
    applicationId: string;
    jobId: string;
    companyId: string;
    status: ApplicationStatus;
    rejectionEmailContent?: string;
  }): Promise<Application | null>;
}
