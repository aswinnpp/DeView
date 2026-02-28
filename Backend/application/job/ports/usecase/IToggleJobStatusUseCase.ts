import type { Job } from '../../../../domain/job/entities/Job.js';
import type { JobStatus } from '../../../../domain/job/entities/Job.js';

export interface IToggleJobStatusUseCase {
  execute(input: { jobId: string; companyId: string; status: JobStatus }): Promise<{ job: Job }>;
}

