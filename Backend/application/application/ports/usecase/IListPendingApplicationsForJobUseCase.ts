import type { Application } from '../../../../domain/application/entities/Application.js';

export interface IListPendingApplicationsInput {
  jobId: string;
  companyId: string;
}

export interface IListPendingApplicationsForJobUseCase {
  execute(input: IListPendingApplicationsInput): Promise<{ data: Application[] }>;
}
