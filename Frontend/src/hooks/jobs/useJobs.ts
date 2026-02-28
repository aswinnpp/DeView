import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm, useFieldArray, type Resolver, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobsService, type Job, type JobCreatePayload } from "../../services/jobs.service";
import { extractApiError } from "../../api/axios";
import { APP_ROUTES, type EmployerBase } from "../../constants/routes";
import { jobFormSchema, defaultJobFormValues, type JobFormValues } from "@shared/contracts/job/form";

export type { Job, JobCreatePayload };

type JobsVariant = "list" | "create" | "edit";

function jobToFormValues(job: Job): JobFormValues {
  return {
    title: job.title ?? "",
    department: job.department ?? "",
    location: job.location ?? "",
    jobType: (job.jobType as JobFormValues["jobType"]) ?? "Full-time",
    workMode: (job.workMode as JobFormValues["workMode"]) ?? "On-site",
    experienceLevel: (job.experienceLevel as JobFormValues["experienceLevel"]) ?? "Mid-level",
    minExperience: job.minExperience ?? "",
    maxExperience: job.maxExperience ?? "",
    salary: job.salary ?? "",
    salaryNonDisclosure: job.salaryNonDisclosure ?? false,
    skills: job.skills ?? "",
    qualifications: job.qualifications ?? "",
    responsibilities: job.responsibilities ?? "",
    benefits: job.benefits ?? "",
    description: job.description ?? "",
    applicationDeadline: job.applicationDeadline ?? "",
    numberOfPositions: job.numberOfPositions ?? 1,
    interviewRounds: job.interviewRounds?.length ? job.interviewRounds : [],
    status: (job.status as JobFormValues["status"]) ?? "OPEN",
  };
}

function getEmployerBase(pathname: string): EmployerBase {
  if (pathname.startsWith("/hr")) return "hr";
  return "company";
}

const PAGE_SIZE = 1;

export function useJobs() {
  const navigate = useNavigate();
  const location = useLocation();
  const employerBase = getEmployerBase(location.pathname);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [jobCreateError, setJobCreateError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema) as Resolver<JobFormValues>,
    defaultValues: defaultJobFormValues,
    mode: "onTouched",
  });

  // @ts-expect-error - zod + useForm generic causes useFieldArray name type to conflict
  const { fields, append, remove, swap } = useFieldArray({ control: form.control, name: "interviewRounds" });

  const currentVariant: JobsVariant = editingJob ? "edit" : isCreating ? "create" : "list";
  const isActive = true;

  const fetchJobs = useCallback(
    async (search?: string, status?: string) => {
      setIsLoading(true);
      setJobsError(null);

      const effectiveSearch = search ?? searchQuery;
      const effectiveStatus = status ?? statusFilter;

      try {
        const { data } = await jobsService.list({
          search: effectiveSearch || undefined,
          status:
            effectiveStatus === "all"
              ? undefined
              : (effectiveStatus as "OPEN" | "CLOSED"),
        });
        setJobs(data );
      } catch (err) {
        setJobsError(extractApiError(err));
        setJobs([]);
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery, statusFilter]
  );

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);
  const myJobs = jobs;

  const totalPages = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE));
  const paginatedJobs = useMemo(
    () => jobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [jobs, page]
  );

  const paginationLabel =
    jobs.length > 0
      ? `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, jobs.length)} of ${jobs.length}`
      : undefined;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    if (editingJob) {
      form.reset(jobToFormValues(editingJob));
    } else if (!isCreating) {
      form.reset(defaultJobFormValues);
    }
  }, [editingJob, isCreating, form]);

  const onSubmit: SubmitHandler<JobFormValues> = useCallback(
    async (data) => {
      if (!isActive) return;
      setJobCreateError(null);
      const payload: JobCreatePayload = {
        ...(data as JobFormValues),
        numberOfPositions: data.numberOfPositions,
      };
      try {
        if (editingJob) {
          await jobsService.update(editingJob.id, payload);
          setEditingJob(null);
        } else {
          await jobsService.create(payload);
          setIsCreating(false);
        }
        await fetchJobs();
        form.reset(defaultJobFormValues);
      } catch (err) {
        setJobCreateError(extractApiError(err));
      }
    },
    [isActive, editingJob, fetchJobs, form]
  );

  const handleCloseModal = useCallback(() => {
    setIsCreating(false);
    setEditingJob(null);
    form.reset(defaultJobFormValues);
  }, [form]);

  const openCreateModal = useCallback(() => {
    setEditingJob(null);
    form.reset(defaultJobFormValues);
    setIsCreating(true);
  }, [form]);

  const openEditModal = useCallback(
    (job: Job) => {
      setEditingJob(job);
      form.reset(jobToFormValues(job));
      setIsCreating(true);
    },
    [form]
  );

  const handleStatusChange = useCallback(
    async (e: React.MouseEvent, job: Job) => {
      e.stopPropagation();
      if (!isActive) return;
      const newStatus = job.status === "OPEN" ? "CLOSED" : "OPEN";
      try {
        await jobsService.toggleStatus(job.id, newStatus as "OPEN" | "CLOSED");
        await fetchJobs();
      } catch (err) {
        console.error("Failed to update job status:", err);
      }
    },
    [fetchJobs, isActive]
  );

  const handleJobClick = useCallback(
    (jobId: string) => {
      const path = APP_ROUTES.JOBS_APPLICATIONS_PATH(employerBase, jobId);
      navigate(path);
    },
    [employerBase, navigate]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const salaryNonDisclosure = form.watch("salaryNonDisclosure");

  return {
    // data
    jobs,
    isLoading,
    jobsError,
    jobCreateError,

    // filters & paging
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    myJobs,
    paginatedJobs,
    totalPages,
    paginationLabel,

    // modal/editing state
    isCreating,
    setIsCreating,
    editingJob,
    setEditingJob,
    viewingJob,
    setViewingJob,
    currentVariant,
    isActive,

    // form
    register,
    handleSubmit,
    errors,
    fields,
    append,
    remove,
    swap,
    salaryNonDisclosure,

    // handlers
    onSubmit,
    openCreateModal,
    openEditModal,
    handleCloseModal,
    handleStatusChange,
    handleJobClick,
    setJobCreateError,
  };
}

