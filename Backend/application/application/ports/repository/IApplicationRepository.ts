import type { Application } from '../../../../domain/application/entities/Application.js';
import type { ApplicationStatus } from '../../../../domain/application/entities/Application.js';

/** Repository for company/HR to list and manage applications. */
export interface IApplicationRepository {
  /** List applications for a job, scoped by companyId. Optional status filter. */
  listByJobId(jobId: string, companyId: string, status?: ApplicationStatus): Promise<Application[]>;
  /** @deprecated Use listByJobId with status 'PENDING'. */
  listPendingByJobId(jobId: string, companyId: string): Promise<Application[]>;
  /** Get one application by id, jobId and companyId (for resume view URL). */
  findByIdAndJobId(applicationId: string, jobId: string, companyId: string): Promise<Application | null>;
}
