import type { Job } from '../../../../domain/job/entities/Job.js';

export interface IListJobsOptions {
  search?: string;
  status?: 'OPEN' | 'CLOSED';
  page?: number;
  limit?: number;
}

export interface IJobRepository {
  findById(id: string): Promise<Job | null>;
  listByCompanyId(companyId: string): Promise<Job[]>;
  listByCompanyIdPaginated(
    companyId: string,
    options?: IListJobsOptions
  ): Promise<{ data: Job[]; total: number }>;
  save(job: Job): Promise<void>;
}

