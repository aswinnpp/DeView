import type { Job } from '../../../../domain/job/entities/Job.js';

export interface IJobRepository {
  findById(id: string): Promise<Job | null>;
  listByCompanyId(companyId: string): Promise<Job[]>;
  save(job: Job): Promise<void>;
}

