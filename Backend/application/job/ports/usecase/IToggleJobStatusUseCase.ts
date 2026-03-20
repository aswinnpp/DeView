import type { Job } from '../../../../domain/entities/Job.js';
import type { JobStatus } from '../../../../domain/entities/Job.js';

export interface IToggleJobStatusUseCase {
  execute(input: { jobId: string; companyId: string; status: JobStatus }): Promise<{ job: Job }>;
}

