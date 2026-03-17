import type { Application, ApplicationStatus } from '../../../domain/application/entities/Application.js';

export interface IListPendingApplicationsForJobInput {
  jobId: string;
  companyId: string;
  status?: ApplicationStatus;
  statuses?: ApplicationStatus[];
}

export interface IListPendingApplicationsForJobResult {
  data: Application[];
  counts: {
    pending: number;
    shortlist: number;
    interview: number;
    interview_complete: number;
    complete: number;
  };
}

