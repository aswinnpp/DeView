import { api } from "../api/axios";
import { API_ROUTES } from "../constants/routes";
import type { ApplicationItem } from "./applications.service";

export interface JobApplicantDetail {
  applicationId: string;
  candidateUserId: string;
  fullName: string;
  email: string;
  status: string;
  appliedAt: string;
}

export interface CandidateJob {
  id: string;
  companyId: string;
  companyName?: string;
  companyApprovalStatus?: string;
  companyIsActive?: boolean;
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
  status: string;
  applicants: JobApplicantDetail[];
  createdAt: string;
  updatedAt: string;
}

function toPaginatedResult(data: unknown): { data: CandidateJob[]; total: number } {
  if (data && typeof data === "object" && "data" in data && "total" in data) {
    const obj = data as { data?: unknown; total?: unknown };
    return {
      data: Array.isArray(obj.data) ? (obj.data as CandidateJob[]) : [],
      total: typeof obj.total === "number" && obj.total >= 0 ? obj.total : 0,
    };
  }
  const wrapped = (data as { data?: CandidateJob[] })?.data;
  const arr = Array.isArray(wrapped) ? wrapped : [];
  return { data: arr, total: arr.length };
}

export interface CandidateJobListParams {
  search?: string;
  status?: "OPEN" | "CLOSED" | "all";
  jobType?: string;
  page?: number;
  limit?: number;
  sortBy?: "date" | "salary" | "title";
  sortOrder?: "asc" | "desc";
}

export interface ApplyForJobParams {
  useResumeFromProfile: boolean;
  coverLetter?: string;
  resumeUrl?: string;
}

export interface MyApplicationsParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortOrder?: "asc" | "desc";
}

function toMyApplicationsResult(data: unknown): { data: ApplicationItem[]; total: number } {
  if (!data || typeof data !== "object" || !("data" in data)) {
    return { data: [], total: 0 };
  }
  const obj = data as { data?: unknown; total?: unknown };
  const items = Array.isArray(obj.data) ? (obj.data as ApplicationItem[]) : [];
  const total = typeof obj.total === "number" && obj.total >= 0 ? obj.total : items.length;
  return { data: items, total };
}

export const candidateJobsService = {
  apply: (jobId: string, params: ApplyForJobParams) =>
    api.post<{ applicationId: string }>(API_ROUTES.CANDIDATE.APPLY(jobId), params),

  listAll: (params?: CandidateJobListParams) =>
    api
      .get<{ data: CandidateJob[]; total: number }>(API_ROUTES.CANDIDATE.JOBS, {
        params: {
          search: params?.search || undefined,
          status:
            params?.status && params.status !== "all"
              ? (params.status as "OPEN" | "CLOSED")
              : undefined,
          jobType: params?.jobType && params.jobType !== "all" ? params.jobType : undefined,
          page: params?.page,
          limit: params?.limit,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
      })
      .then((res) => toPaginatedResult(res.data)),

  listMyApplications: (params?: MyApplicationsParams) =>
    api
      .get(API_ROUTES.CANDIDATE.MY_APPLICATIONS, {
        params: {
          status: params?.status && params.status !== "all" ? params.status : undefined,
          search: params?.search?.trim() || undefined,
          page: params?.page,
          limit: params?.limit,
          sortOrder: params?.sortOrder,
        },
      })
      .then((res) => toMyApplicationsResult(res.data)),
};
