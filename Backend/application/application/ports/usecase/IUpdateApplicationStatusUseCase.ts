import type { Application, ApplicationStatus } from '../../../../domain/application/entities/Application.js';

export interface IUpdateApplicationStatusInput {
  applicationId: string;
  jobId: string;
  companyId: string;
  status: ApplicationStatus;
  rejectionEmailContent?: string;
}

export interface IUpdateApplicationStatusResult {
  application: Application;
}

export interface IUpdateApplicationStatusUseCase {
  execute(input: IUpdateApplicationStatusInput): Promise<IUpdateApplicationStatusResult>;
}

