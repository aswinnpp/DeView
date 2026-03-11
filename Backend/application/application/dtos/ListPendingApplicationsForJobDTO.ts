import type { Application, ApplicationStatus } from '../../../domain/application/entities/Application.js';

export interface IListPendingApplicationsForJobInput {
  jobId: string;
  companyId: string;
  status?: ApplicationStatus;
}

export interface IListPendingApplicationsForJobResult {
  data: Application[];
}

