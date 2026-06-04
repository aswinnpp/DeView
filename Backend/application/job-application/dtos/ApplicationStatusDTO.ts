/** Application status update — input + output in one module. */

import type { ApplicationStatus } from '../../../domain/entities/Application.js';
import type { ApplicationView } from './ApplicationView.js';

export interface IUpdateApplicationStatusInputDTO {
  applicationId: string;
  jobId: string;
  companyId: string;
  status: ApplicationStatus;
  rejectionEmailContent?: string;
  offerEmailContent?: string;
  offerSalary?: string;
  offerLocation?: string;
  offerStartDate?: string;
  offerBenefits?: string;
}

export interface IUpdateApplicationStatusOutputDTO {
  application: ApplicationView;
}
