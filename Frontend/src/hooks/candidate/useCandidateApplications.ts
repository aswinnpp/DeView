import { useEffect, useMemo, useState } from "react";
import type { ApplicationItem } from "../../services/applications.service";
import { candidateJobsService, type CandidateJob } from "../../services/candidateJobs.service";

type JobInfo = {
  id: string;
  title: string;
  companyName?: string;
  location: string;
  jobType: string;
  salary?: string;
  salaryNonDisclosure?: boolean;
  description?: string;
  requirements?: string[];
  skills?: string[];
};

export type ApplicationWithJob = ApplicationItem & {
  job?: JobInfo;
};

export type FilterOptions = {
  status?: string;
  search?: string;
  page?: number;
  itemsPerPage?: number;
  sortOrder?: "asc" | "desc";
};

type HookResult = {
  applications: ApplicationWithJob[];
  totalApplications: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
};


export function useCandidateApplications(options: FilterOptions = {}): HookResult {
  const status = options.status;
  const search = options.search;
  const page = options.page ?? 1;
  const itemsPerPage = options.itemsPerPage ?? 10;
  const sortOrder = options.sortOrder ?? "desc";

  const [rawApplications, setRawApplications] = useState<ApplicationItem[]>([]);
  const [jobs, setJobs] = useState<JobInfo[]>([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Load all jobs once (we use these to add job details to each application)
  useEffect(() => {
    let cancelled = false;

    async function fetchJobs() {
      try {
        const res = await candidateJobsService.listAll({ status: "all", limit: 500 });
        if (cancelled) return;
        const jobList: JobInfo[] = res.data.map((j: CandidateJob) => ({
          id: j.id,
          title: j.title,
          companyName: j.companyName,
          location: j.location,
          jobType: j.jobType,
          salary: j.salary,
          salaryNonDisclosure: j.salaryNonDisclosure,
          description: j.description,
          requirements: j.responsibilities ? j.responsibilities.split("\n") : [],
          skills: j.skills ? j.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
        }));
        setJobs(jobList);
      } catch {
        if (!cancelled) setJobs([]);
      }
    }

    fetchJobs();
    return () => {
      cancelled = true;
    };
  }, []);

  // Step 2: Load applications when filters or page change (backend does search/filter)
  useEffect(() => {
    let cancelled = false;

    async function fetchApplications() {
      setIsLoading(true);
      setError(null);

      try {
        const { data: items, total } = await candidateJobsService.listMyApplications({
          status: status && status !== "all" ? status : undefined,
          search: search?.trim() || undefined,
          page,
          limit: itemsPerPage,
          sortOrder,
        });

        if (cancelled) return;

        setRawApplications(items);
        setTotalApplications(total);
        setTotalPages(Math.max(1, Math.ceil(total / itemsPerPage)));
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load applications";
          setError(message);
          setRawApplications([]);
          setTotalApplications(0);
          setTotalPages(1);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchApplications();
    return () => {
      cancelled = true;
    };
  }, [status, search, page, itemsPerPage, sortOrder]);

  // Step 3: Attach job details to each application (for display)
  const applications = useMemo(() => {
    return rawApplications.map((app) => {
      const job = jobs.find((j) => j.id === app.jobId);
      const jobToAttach = job
        ? { ...job, salary: job.salaryNonDisclosure ? undefined : job.salary }
        : undefined;
      return { ...app, job: jobToAttach };
    });
  }, [rawApplications, jobs]);

  return {
    applications,
    totalApplications,
    totalPages,
    isLoading,
    error,
  };
}

