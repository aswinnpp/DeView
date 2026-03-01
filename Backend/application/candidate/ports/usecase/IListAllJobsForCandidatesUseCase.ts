import type { JobStatus } from '../../../../domain/job/entities/Job.js';
import type { IJobApplicantDetail } from '../../../../domain/job/entities/JobApplicant.js';

export interface IListAllJobsForCandidatesInput {
  search?: string;
  status?: 'OPEN' | 'CLOSED' | 'all';
  jobType?: string;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'salary' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// Lightweight DTO used for candidate job listings
export interface CandidateJobForList {
  id: string | null;
  companyId: string;
  title: string;
  department: string;
  location: string;
  jobType: string;
  workMode: string;
  experienceLevel: string;
  minExperience?: string;
  maxExperience?: string;
  salary?: string;
  salaryNonDisclosure: boolean;
  skills: string;
  qualifications: string;
  responsibilities: string;
  benefits?: string;
  description: string;
  applicationDeadline?: string;
  numberOfPositions: number;
  interviewRounds: string[];
  status: JobStatus;
  applicants: IJobApplicantDetail[];
  createdAt: Date;
  updatedAt: Date;
  companyName?: string;
  companyApprovalStatus?: string;
  companyIsActive?: boolean;
}

export interface IListAllJobsForCandidatesResult {
  data: CandidateJobForList[];
  total: number;
}

export interface IListAllJobsForCandidatesUseCase {
  execute(input: IListAllJobsForCandidatesInput): Promise<IListAllJobsForCandidatesResult>;
}



