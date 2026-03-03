import type { Application, ApplicationStatus } from '../../../domain/application/entities/Application.js';

export interface IListPendingApplicationsForJobInput {
  jobId: string;
  companyId: string;
  /** Optional status filter. If omitted, returns all applications. */
  status?: ApplicationStatus;
}

export interface IListPendingApplicationsForJobResult {
  data: Application[];
}

