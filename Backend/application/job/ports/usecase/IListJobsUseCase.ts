import type { Job } from '../../../../domain/job/entities/Job.js';

export interface IListJobsInput {
  companyId: string;
  search?: string;
  status?: 'OPEN' | 'CLOSED';
}

export interface IListJobsUseCase {
  execute(input: IListJobsInput): Promise<Job[]>;
}

