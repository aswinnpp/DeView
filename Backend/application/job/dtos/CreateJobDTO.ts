import type { JobFormValues } from '../../../../Shared/contracts/job/form.js';

export interface ICreateJobDTO extends JobFormValues {
  companyId: string;
  userId: string;
}

