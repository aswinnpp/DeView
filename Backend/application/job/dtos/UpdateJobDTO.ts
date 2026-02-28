import type { JobFormValues } from '../../../../Shared/contracts/job/form.js';

export interface IUpdateJobDTO {
  jobId: string;
  companyId: string;
  userId: string;
  data: Partial<JobFormValues>;
}

