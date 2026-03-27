import { useState, useEffect, useCallback } from "react";
import { candidateJobsService, type CandidateJob } from "../../services/candidateJobs.service";
import { candidateService } from "../../services/candidate.service";

import { useFileUpload } from "../useFileUpload";
import { extractApiError } from "../../api/axios";


const PAGE_SIZE = 2 ;

function formatPostedTime(createdAt: string): string {
  const posted = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - posted.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  }
  const months = Math.floor(diffDays / 30);
  return `${months} month${months !== 1 ? "s" : ""} ago`;
}

export function useCandidateJob() {
  const [selectedJob, setSelectedJob] = useState<CandidateJob | null>(null);
  const [showApplicationConfirm, setShowApplicationConfirm] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [profileResumeUrl, setProfileResumeUrl] = useState<string | null>(null);
  const [useResumeFromProfile, setUseResumeFromProfile] = useState(true);
  const { upload, isUploading, uploadedFile, reset: resetFileUpload } = useFileUpload();
  const [searchQuery, setSearchQuery] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const [buttonn, setButton] = useState(true);

  const [rawJobs, setRawJobs] = useState<CandidateJob[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, total: totalCount } = await candidateJobsService.listAll({
        search: searchQuery || undefined,
        status: "OPEN",
        jobType: jobTypeFilter !== "all" ? jobTypeFilter : undefined,
        page,
        limit: PAGE_SIZE,
        sortBy: "date",
        sortOrder,
      });
      setRawJobs(data);
      setTotal(totalCount);
    } catch (err) {
      setError(extractApiError(err));
      setRawJobs([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, jobTypeFilter, page, sortOrder]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Fetch profile resume when entering confirm application screen
  useEffect(() => {
    if (showApplicationConfirm) {
      candidateService
        .getProfile()
        .then((res) => {
          const url = res?.data?.profile?.resumeUrl ?? null;
          setProfileResumeUrl(url ?? null);
          setUseResumeFromProfile(!!url);
        })
        .catch(() => {
          setProfileResumeUrl(null);
          setUseResumeFromProfile(false);
        });
    } else {
      setProfileResumeUrl(null);
      setUseResumeFromProfile(true);
      resetFileUpload();
    }
  }, [showApplicationConfirm, resetFileUpload]);

  const jobs = rawJobs;

  // Checkbox checked = use profile only. Unchecked = add new resume only.
  const applicationResumeUrl = useResumeFromProfile ? profileResumeUrl : uploadedFile?.url ?? null;

  // When user checks "use profile", clear any uploaded file
  useEffect(() => {
    if (useResumeFromProfile) {
      resetFileUpload();
    }
  }, [useResumeFromProfile, resetFileUpload]);

  const handleResumeFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    void upload(file, "resume");
  }, [upload]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasActiveFilters = searchQuery || jobTypeFilter !== "all" || sortOrder !== "desc";

  const handleJobClick = useCallback((job: CandidateJob) => {
    setButton(true);
    setSelectedJob(job);


    


    async function fetch() {

    
      

     const application = await candidateJobsService.listMyApplications()

     for( const i of application.data){
        if(job.id === i.jobId){
          setButton(false)

     }

     
  }
}

  fetch()

    setShowApplicationConfirm(false);
  }, []);

  const handleApplyClick = useCallback(() => {
    setShowApplicationConfirm(true);
  }, []);

  const handleCancelApplication = useCallback(() => {
    setShowApplicationConfirm(false);
    setSubmitError(null);
    resetFileUpload();
  }, [resetFileUpload]);

  const handleSubmitApplication = useCallback(async () => {
    if (!selectedJob) return;
    setSubmitError(null);

    // Validate: checkbox checked but no profile resume
    if (useResumeFromProfile && !profileResumeUrl?.trim()) {
      setSubmitError("Resume not in profile. Please upload a resume to your profile or add a new resume below.");
      return;
    }

    // Validate: checkbox unchecked but no new resume
    if (!useResumeFromProfile && !uploadedFile?.url?.trim()) {
      setSubmitError("Please upload a resume.");
      return;
    }

    setIsSubmitting(true);
    try {
      await candidateJobsService.apply(selectedJob.id, {
        useResumeFromProfile,
        coverLetter: coverLetter.trim() || undefined,
        resumeUrl: useResumeFromProfile ? undefined : uploadedFile?.url ?? undefined,
      });
      setShowApplicationConfirm(false);
      setSelectedJob(null);
      setCoverLetter("");
      resetFileUpload();
    } catch (err) {
      setSubmitError(extractApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedJob, useResumeFromProfile, profileResumeUrl, uploadedFile?.url, coverLetter, resetFileUpload]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setJobTypeFilter("all");
    setSortOrder("desc");
    setPage(1);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((nextPage: number) => {
    const clamped = Math.max(1, Math.min(totalPages, nextPage));
    setPage(clamped);
  }, [totalPages]);

  return {
    // job view state
    selectedJob,
    setSelectedJob,
    showApplicationConfirm,
    coverLetter,
    setCoverLetter,

    // resume
    profileResumeUrl,
    useResumeFromProfile,
    setUseResumeFromProfile,
    applicationResumeUrl,
    isUploadingResume: isUploading,
    handleResumeFileSelect,

    submitError,
    setSubmitError,
    isSubmitting,

    // list state
    jobs,
    total,
    totalPages,
    isLoading,
    error,

    // filters
    searchQuery,
    setSearchQuery,
    jobTypeFilter,
    setJobTypeFilter,
    sortOrder,
    setSortOrder,
    page,
    setPage,
    hasActiveFilters,

    // handlers
    handleJobClick,
    handleApplyClick,
    handleCancelApplication,
    handleSubmitApplication,
    handleClearFilters,
    handleSearch,
    handlePageChange,

    // utils
    formatPostedTime,
    buttonn
  };
}
