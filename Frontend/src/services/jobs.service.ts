import { api } from "../api/axios";
import { API_ROUTES } from "../constants/routes";

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
  applicants: string[];
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

function toList(data: unknown): Job[] {
  if (Array.isArray(data)) return data;
  const wrapped = (data as { data?: Job[] })?.data;
  return Array.isArray(wrapped) ? wrapped : [];
}

export interface JobListParams {
  search?: string;
  status?: "OPEN" | "CLOSED" | "all";
}

export const jobsService = {
  list: (params?: JobListParams) =>
    api
      .get<{ data: Job[] }>(API_ROUTES.JOB.JOBS_LIST, {
        params: {
          search: params?.search || undefined,
          status:
            params?.status && params.status !== "all"
              ? (params.status as "OPEN" | "CLOSED")
              : undefined,
        },
      })
      .then((res) => ({
        data: toList(res.data),
      })),

  create: (payload: JobCreatePayload) =>
    api.post<{ data: Job }>(API_ROUTES.JOB.JOB_CREATE, payload),

  update: (id: string, payload: Partial<JobCreatePayload>) =>
    api.put<{ data: Job }>(API_ROUTES.JOB.JOB_UPDATE(id), payload),

  toggleStatus: (id: string, status: "OPEN" | "CLOSED") =>
    api.put<{ data: Job }>(API_ROUTES.JOB.JOB_TOGGLE_STATUS(id), { status }),
};
