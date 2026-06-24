import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray, type Resolver, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobsService, type Job, type JobCreatePayload } from "../../services/jobs.service";
import { extractApiError } from "../../api/axios";
import {
  jobFormSchema,
  defaultJobFormValues,
  isJobDeadlinePast,
  JOB_DEADLINE_PAST_MESSAGE,
  type JobFormValues,
} from "@shared/contracts/job/form";
import { showToast } from "../../components/common/toastService";

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



const PAGE_SIZE = 2;

export function useJobs() {

  

  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
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
    async (opts?: { search?: string; status?: string; page?: number }) => {
      setIsLoading(true);
      setJobsError(null);

      const effectiveSearch = opts?.search ?? searchQuery;
      const effectiveStatus = opts?.status ?? statusFilter;
      const effectivePage = opts?.page ?? page;

      try {
        const { data: jobsData, total } = await jobsService.list({
          search: effectiveSearch || undefined,
          status:
            effectiveStatus === "all"
              ? undefined
              : (effectiveStatus as "OPEN" | "CLOSED"),
          page: effectivePage,
          limit: PAGE_SIZE,
        });
        setJobs(jobsData);
        setTotal(total);
      } catch (err) {
        setJobsError(extractApiError(err));
        setJobs([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery, statusFilter, page]
  );

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const myJobs = jobs;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginatedJobs = jobs;

  
  useEffect(() => {
    setPage(1);
    fetchJobs({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          setIsCreating(false);
        } else {
          await jobsService.create(payload);
          setIsCreating(false);
        }
        await fetchJobs();
        form.reset(defaultJobFormValues);
      } catch (err) {
        setJobCreateError(extractApiError(err));
        setEditingJob(null);
        setIsCreating(false);
      }
    },
    [isActive, editingJob, fetchJobs, form, setEditingJob, setIsCreating, setJobCreateError]
  );



  const handleCloseModal = useCallback(() => {
    setIsCreating(false);
    setEditingJob(null);
    form.reset(defaultJobFormValues);
  }, [form]);

  const openCreateModal = useCallback(() => {
    


    const f = async () => {


      try {
        setEditingJob(null);
    form.reset(defaultJobFormValues);
         await jobsService.subscribtion();
        
        
        setIsCreating(true);
      } catch (error) {
        setJobCreateError(extractApiError(error));
      }

   

   
    }
    f()
   
   
  }, [form]);

  const openEditModal = useCallback(
    (job: Job) => {
      if (isJobDeadlinePast(job.applicationDeadline)) {
        showToast(JOB_DEADLINE_PAST_MESSAGE, "error");
        return;
      }
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
      if (newStatus === "OPEN" && isJobDeadlinePast(job.applicationDeadline)) {
        showToast(JOB_DEADLINE_PAST_MESSAGE, "error");
        return;
      }
      try {
        await jobsService.toggleStatus(job.id, newStatus as "OPEN" | "CLOSED");
        await fetchJobs();
      } catch (err){
        showToast(extractApiError(err), "error");
      }
    },
    [fetchJobs, isActive]
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
    setJobCreateError,
  };
}

