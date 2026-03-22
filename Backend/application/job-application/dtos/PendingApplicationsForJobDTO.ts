/** List pending applications for a job — input + output in one module. */

import type { Application, ApplicationStatus } from '../../../domain/entities/Application.js';

export interface IListPendingApplicationsForJobInputDTO {
  jobId: string;
  companyId: string;
  status?: ApplicationStatus;
  statuses?: ApplicationStatus[];
}

export interface IListPendingApplicationsForJobOutputDTO {
  data: Application[];
  counts: {
    pending: number;
    shortlist: number;
    interview: number;
    interview_complete: number;
    complete: number;
  };
}
