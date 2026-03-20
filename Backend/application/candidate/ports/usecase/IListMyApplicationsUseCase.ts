import type { Application } from '../../../../domain/entities/Application.js';
import type { ApplicationStatus } from '../../../../domain/entities/Application.js';

export interface IListMyApplicationsInput {
  candidateUserId: string;
  status?: ApplicationStatus;
  search?: string;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface IListMyApplicationsResult {
  data: Application[];
  total: number;
}

export interface IListMyApplicationsUseCase {
  execute(input: IListMyApplicationsInput): Promise<IListMyApplicationsResult>;
}

