import type { ApplicationStatus } from '../../../../domain/entities/Application.js';
import type { ApplicationView } from '../../../job-application/dtos/ApplicationView.js';

export interface IListMyApplicationsInput {
  candidateUserId: string;
  status?: ApplicationStatus;
  search?: string;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface IListMyApplicationsResult {
  data: ApplicationView[];
  total: number;
}

export interface IListMyApplicationsUseCase {
  execute(input: IListMyApplicationsInput): Promise<IListMyApplicationsResult>;
}

