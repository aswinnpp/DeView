import type { Job } from '../../../../domain/entities/Job.js';

export interface IListJobsOptions {
  search?: string;
  status?: 'OPEN' | 'CLOSED';
  jobType?: string;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'salary' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface IJobRepository {
  findById(id: string): Promise<Job | null>;
  listByCompanyId(companyId: string): Promise<Job[]>;
  listByCompanyIdPaginated(
    companyId: string,
    options?: IListJobsOptions
  ): Promise<{ data: Job[]; total: number }>;
  listAllPaginated(options?: IListJobsOptions): Promise<{ data: Job[]; total: number }>;
  save(job: Job): Promise<void>;
 
}

