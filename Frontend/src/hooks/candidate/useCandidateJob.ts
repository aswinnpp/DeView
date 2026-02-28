import { useState, useEffect, useCallback } from "react";
import { candidateJobsService, type CandidateJob } from "../../services/candidateJobs.service";
import { extractApiError } from "../../api/axios";

const PAGE_SIZE = 2;

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
  const [searchQuery, setSearchQuery] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const [rawJobs, setRawJobs] = useState<CandidateJob[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const jobs = rawJobs;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasActiveFilters = searchQuery || jobTypeFilter !== "all" || sortOrder !== "desc";

  const handleJobClick = useCallback((job: CandidateJob) => {
    setSelectedJob(job);
    setShowApplicationConfirm(false);
  }, []);

  const handleApplyClick = useCallback(() => {
    setShowApplicationConfirm(true);
  }, []);

  const handleCancelApplication = useCallback(() => {
    setShowApplicationConfirm(false);
  }, []);

  const handleSubmitApplication = useCallback(() => {
    if (!selectedJob) return;
    alert("Application submitted (demo only, no API call).");
    setShowApplicationConfirm(false);
    setSelectedJob(null);
    setCoverLetter("");
  }, [selectedJob]);

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
  };
}
