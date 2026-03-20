import type { Application, ApplicationStatus } from '../../../domain/entities/Application.js';

export interface IUpdateApplicationStatusInputDTO {
  applicationId: string;
  jobId: string;
  companyId: string;
  status: ApplicationStatus;
  rejectionEmailContent?: string;
}

export interface IUpdateApplicationStatusResultDTO {
  application: Application;
}

