import type { Job } from '../../../../domain/job/entities/Job.js';

export interface IListJobsInput {
  companyId: string;
  search?: string;
  status?: 'OPEN' | 'CLOSED';
  page?: number;
  limit?: number;
}

export interface IListJobsResult {
  data: Job[];
  total: number;
}

export interface IListJobsUseCase {
  execute(input: IListJobsInput): Promise<IListJobsResult>;
}

