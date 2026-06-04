/** Job create/update/toggle/list — input + output in one module. */

import type { JobFormValues } from '../../../../Shared/contracts/job/form.js';
import type { Job, JobStatus } from '../../../domain/entities/Job.js';

export interface ICreateJobInputDTO extends JobFormValues {
  companyId: string;
  userId: string;
}

export interface ICreateJobOutputDTO {
  job: Job;
}

export interface IUpdateJobInputDTO {
  jobId: string;
  companyId: string;
  userId: string;
  data: Partial<JobFormValues>;
}

export interface IUpdateJobOutputDTO {
  job: Job;
}

export interface IToggleJobStatusInputDTO {
  jobId: string;
  companyId: string;
  status: JobStatus;
}

export interface IToggleJobStatusOutputDTO {
  job: Job;
}

export interface IListJobsInputDTO {
  companyId: string;
  search?: string;
  status?: 'OPEN' | 'CLOSED';
  page?: number;
  limit?: number;
}

export interface IListJobsOutputDTO {
  data: Job[];
  total: number;
}
