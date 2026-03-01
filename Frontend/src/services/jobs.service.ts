import { api } from "../api/axios";
import { API_ROUTES } from "../constants/routes";

export interface JobApplicantDetail {
  applicationId: string;
  candidateUserId: string;
  fullName: string;
  email: string;
  status: string;
  appliedAt: string;
}

export interface Job {
  id: string;
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
  status: string;
  applicants: JobApplicantDetail[];
  createdAt: string;
  updatedAt: string;
}

export type JobCreatePayload = Omit<
  Job,
  "id" | "companyId" | "applicants" | "createdAt" | "updatedAt" | "numberOfPositions"
> & {
  numberOfPositions: string | number;
  status?: string;
};

function toPaginatedResult(data: unknown): { data: Job[]; total: number } {
  if (data && typeof data === "object" && "data" in data && "total" in data) {
    const obj = data as { data?: unknown; total?: unknown };
    return {
      data: Array.isArray(obj.data) ? obj.data : [],
      total: typeof obj.total === "number" && obj.total >= 0 ? obj.total : 0,
    };
  }
  const wrapped = (data as { data?: Job[] })?.data;
  const arr = Array.isArray(wrapped) ? wrapped : [];
  return { data: arr, total: arr.length };
}

export interface JobListParams {
  search?: string;
  status?: "OPEN" | "CLOSED" | "all";
  page?: number;
  limit?: number;
}

export const jobsService = {
  list: (params?: JobListParams) =>
    api
      .get<{ data: Job[]; total: number }>(API_ROUTES.JOB.JOBS_LIST, {
        params: {
          search: params?.search || undefined,
          status:
            params?.status && params.status !== "all"
              ? (params.status as "OPEN" | "CLOSED")
              : undefined,
          page: params?.page,
          limit: params?.limit,
        },
      })
      .then((res) => toPaginatedResult(res.data)),

  create: (payload: JobCreatePayload) =>
    api.post<{ data: Job }>(API_ROUTES.JOB.JOB_CREATE, payload),

  update: (id: string, payload: Partial<JobCreatePayload>) =>
    api.put<{ data: Job }>(API_ROUTES.JOB.JOB_UPDATE(id), payload),

  toggleStatus: (id: string, status: "OPEN" | "CLOSED") =>
    api.put<{ data: Job }>(API_ROUTES.JOB.JOB_TOGGLE_STATUS(id), { status }),
};
