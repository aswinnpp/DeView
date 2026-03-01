import { api } from "../api/axios";
import { API_ROUTES } from "../constants/routes";

export interface ApplicationItem {
  id: string;
  jobId: string;
  companyId: string;
  candidateUserId: string;
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  title?: string;
  currentCompany?: string;
  experience?: string;
  bio?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  preferredWorkMode?: string;
  preferredJobType?: string;
  skills: string[];
  education?: string;
  university?: string;
  graduationYear?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  resumeUrl: string;
  coverLetter?: string;
  status: "PENDING" | "SHORTLISTED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export interface JobApplicantDoc {
  applicationId: string;
  candidateUserId: string;
  fullName: string;
  email: string;
  status: string;
  appliedAt: string;
}

export interface JobListItem {
  id: string;
  companyId: string;
  title: string;
  department: string;
  location: string;
  jobType: string;
  salary?: string;
  status: string;
  applicants?: JobApplicantDoc[];
  createdAt: string;
  updatedAt: string;
}

function toJobsResult(data: unknown): { data: JobListItem[]; total: number } {
  if (data && typeof data === "object" && "data" in data && "total" in data) {
    const obj = data as { data?: unknown; total?: unknown };
    return {
      data: Array.isArray(obj.data) ? obj.data : [],
      total: typeof obj.total === "number" && obj.total >= 0 ? obj.total : 0,
    };
  }
  const wrapped = (data as { data?: JobListItem[] })?.data;
  const arr = Array.isArray(wrapped) ? wrapped : [];
  return { data: arr, total: arr.length };
}

function toApplicationsResult(data: unknown): ApplicationItem[] {
  if (data && typeof data === "object" && "data" in data) {
    const obj = data as { data?: unknown };
    return Array.isArray(obj.data) ? obj.data : [];
  }
  return [];
}

export const applicationsService = {
  listJobs: (params?: { search?: string; status?: "OPEN" | "CLOSED"; page?: number; limit?: number }) =>
    api
      .get<{ data: JobListItem[]; total: number }>(API_ROUTES.APPLICATIONS.JOBS_LIST, {
        params: {
          search: params?.search,
          status: params?.status,
          page: params?.page,
          limit: params?.limit ?? 100,
        },
      })
      .then((res) => toJobsResult(res.data)),

  listPendingApplications: (jobId: string) =>
    api
      .get<{ data: ApplicationItem[] }>(API_ROUTES.APPLICATIONS.PENDING_APPLICATIONS(jobId))
      .then((res) => toApplicationsResult(res.data)),

  /** Get a fresh pre-signed URL to view resume (avoids expired S3 link). */
  getResumeViewUrl: async (jobId: string, applicationId: string): Promise<string> => {
    const res = await api.get<{ url?: string }>(
      API_ROUTES.APPLICATIONS.RESUME_VIEW_URL(jobId, applicationId)
    );
    const url = (res.data as { url?: string })?.url;
    if (!url) throw new Error("No resume URL returned");
    return url;
  },
};
