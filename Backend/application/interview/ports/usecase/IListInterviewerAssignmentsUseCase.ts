import type { Interview } from '../../../../domain/entities/Interview.js';

export interface IListInterviewerAssignmentsInput {
  interviewerUserId: string;
  search?: string;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
  acceptedOnly?: boolean;
}

export interface IListInterviewerAssignmentsUseCase {
  execute(input: IListInterviewerAssignmentsInput): Promise<{ data: Interview[]; total: number }>;
}

