import type { Application } from '../../../../domain/application/entities/Application.js';
import type { ApplicationStatus } from '../../../../domain/application/entities/Application.js';

export interface IListPendingApplicationsInput {
  jobId: string;
  companyId: string;
  /** Optional status filter. If omitted, returns all applications. */
  status?: ApplicationStatus;
}

export interface IListPendingApplicationsForJobUseCase {
  execute(input: IListPendingApplicationsInput): Promise<{ data: Application[] }>;
}
