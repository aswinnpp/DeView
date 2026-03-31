import { useState, useEffect } from "react";
import { applicationsService, type ApplicationItem } from "../../services/applications.service";
import { showToast } from "../../components/common/toastService";
import { extractApiError } from "../../api/axios";

export type ApplicantStatus = "PENDING" | "SHORTLISTED" | "REJECTED";
export type ExtendedApplicantStatus =
  | ApplicantStatus
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_COMPLETE"
  | "COMPLETED"
  | "HIRED"
  | "RESCHEDULE_REQUESTED";

export type CandidatePipelineTab =
  | "pending"
  | "shortlist"
  | "interview"
  | "interview_complete"
  | "complete";

export interface Candidate {
  id: string;
  applicationId: string;
  jobId: string;
  candidateId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  education: string;
  skills: string;
  status: ExtendedApplicantStatus;
  appliedDate: string;
  resume: string | null;
  coverLetter: string | null;
  title?: string;
  currentCompany?: string;
  currentSalary?: string;
  bio?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  preferredWorkMode?: string;
  preferredJobType?: string;
  willingToRelocate?: boolean;
  skillsArray?: string[];
  languages?: string[];
  university?: string;
  graduationYear?: string;
  educationList?: Array<{ degree: string; institution: string; year: string }>;
  workExperience?: Array<{ jobTitle: string; company: string; startDate: string; endDate?: string; description?: string }>;
  linkedinUrl?: string;
  githubUrl?: string;
  dateOfBirth?: string;
  resumeUrl?: string;
  aiScore?: number;
  currentRound?: string;
  attemptedRounds?: string[];
  completedRounds?: Array<{
    roundName: string;
    interviewer: string;
    date: string;
    score: number;
    result: "PASSED" | "FAILED";
    feedback: string;
  }>;
  rescheduleRequest?: {
    originalDate: string;
    originalTime: string;
    requestedDate: string;
    requestedTime: string;
    reason: string;
    requestedAt: string;
  };
  interviewDetails?: ApplicationItem["interviewDetails"];
  /** Interviewer-provided reason when an interviewer requested reschedule. */
  interviewerRejectReason?: string;
}

export interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  status: string;
  department?: string;
  salary?: string;
  jobType?: string;
  applicantCount?: number;
  interviewRounds?: string[];
}


export const COMPANY_PLACEHOLDER = {
  name: "Company",
  address: "",
  website: "",
  contactPerson: "HR",
};

const JOBS_PER_PAGE = 3;
const CANDIDATES_PER_PAGE = 3;

function buildCompletedRoundsFromApi(apiApp: ApplicationItem): Candidate["completedRounds"] {
  const completed = apiApp.completedRounds ?? [];
  const rounds = apiApp.interviewRounds ?? [];
  if (completed.length === 0) return [];
  return completed.map((roundName) => {
    const entry = rounds.find((r) => r.round === roundName);
    const score = entry?.totalScore ?? 0;
    const n = typeof score === "number" ? score : 0;
    return {
      roundName,
      interviewer: entry?.interviewer ?? "—",
      date: entry ? `${entry.scheduledDate} ${entry.scheduledTime}` : "—",
      score: n,
      result: n >= 3 ? ("PASSED" as const) : ("FAILED" as const),
      feedback: entry?.feedback ?? "",
    };
  });
}

function mapApiApplicationToCandidate(apiApp: ApplicationItem, jobId: string): Candidate {
  const appliedDate = apiApp.createdAt
    ? new Date(apiApp.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";

  const skillsArray = Array.isArray(apiApp.skills) ? apiApp.skills : [];
  const skillsStr = skillsArray.join(", ");

  const latestInterviewerRejectReason =
    apiApp.interviewDetails?.interviewerRejectReason ??
    (apiApp.interviewRounds ?? []).find(
      (r) => r.interviewerRejectReason && r.interviewerAccepted === false
    )?.interviewerRejectReason ??
    (apiApp.interviewRounds ?? []).find((r) => r.interviewerRejectReason)?.interviewerRejectReason ??
    undefined;

  return {
    id: String(apiApp.id ?? ""),
    applicationId: String(apiApp.id ?? ""),
    jobId,
    candidateId: String(apiApp.candidateUserId ?? ""),
    name: String(apiApp.fullName ?? ""),
    email: String(apiApp.email ?? ""),
    phone: apiApp.phone ?? "",
    location: apiApp.location ?? "",
    experience: apiApp.experience ?? "-",
    education: apiApp.education ?? "-",
    skills: skillsStr,
    status: (apiApp.status ?? "PENDING") as ExtendedApplicantStatus,
    appliedDate,
    resume: apiApp.resumeUrl ? "resume" : null,
    coverLetter: apiApp.coverLetter ?? null,
    title: apiApp.title,
    currentCompany: apiApp.currentCompany,
    bio: apiApp.bio,
    expectedSalary: apiApp.expectedSalary,
    noticePeriod: apiApp.noticePeriod,
    preferredWorkMode: apiApp.preferredWorkMode,
    preferredJobType: apiApp.preferredJobType,
    skillsArray,
    university: apiApp.university,
    graduationYear: apiApp.graduationYear,
    educationList: apiApp.educationList ?? [],
    workExperience: apiApp.workExperience ?? [],
    linkedinUrl: apiApp.linkedinUrl,
    githubUrl: apiApp.githubUrl,
    resumeUrl: apiApp.resumeUrl,
    aiScore: apiApp.aiScore,
    interviewDetails: apiApp.interviewDetails,
    rescheduleRequest: apiApp.rescheduleRequest,
    interviewerRejectReason: latestInterviewerRejectReason,
    attemptedRounds: apiApp.completedRounds ?? [],
    completedRounds: buildCompletedRoundsFromApi(apiApp),
  };
}


export function useApplication() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsPage, setJobsPage] = useState(1);
  const [jobsTotal, setJobsTotal] = useState(0);

  const [pendingApplications, setPendingApplications] = useState<Candidate[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [candidatePipelineTab, setCandidatePipelineTab] = useState<CandidatePipelineTab>("pending");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [candidatesPage, setCandidatesPage] = useState(1);
  const [resumeLinkLoading, setResumeLinkLoading] = useState(false);

  const [isScoringPendingCandidates, setIsScoringPendingCandidates] = useState(false);
  const [scoredCandidateIds, setScoredCandidateIds] = useState<Set<string>>(new Set());
  const [candidateScores, setCandidateScores] = useState<Record<string, number>>({});

  const [candidateCounts, setCandidateCounts] = useState({
    pending: 0,
    shortlist: 0,
    complete: 0,
  });

  useEffect(() => {
    let isCancelled = false;
    setJobsLoading(true);

    applicationsService
      .listJobs({ page: jobsPage, limit: JOBS_PER_PAGE })
      .then((res) => {
        if (isCancelled) return;
        setJobs(
          res.data.map((j) => ({
            id: j.id,
            title: j.title,
            location: j.location,
            type: j.jobType,
            status: j.status,
            department: j.department,
            salary: j.salary,
            jobType: j.jobType,
            applicantCount: j.applicants?.length ?? 0,
            interviewRounds: j.interviewRounds ?? [],
          }))
        );
        setJobsTotal(res.total);
      })
      .catch(() => {
        if (!isCancelled) setJobs([]);
      })
      .finally(() => {
        if (!isCancelled) setJobsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [jobsPage]);

  useEffect(() => {
    if (!selectedJob) {
      setPendingApplications([]);
      return;
    }

    let isCancelled = false;
    setApplicationsLoading(true);

    const load = async () => {
      try {
        const res = await applicationsService.listApplications(selectedJob.id, {
          pipelineTab: candidatePipelineTab,
        });
        if (isCancelled) return;
        const candidates = res.data.map((a) => mapApiApplicationToCandidate(a, selectedJob.id));
        setPendingApplications(candidates);
        setCandidateCounts({
          pending: res.counts.pending,
          shortlist: res.counts.shortlist,
          complete: res.counts.complete,
        });
      } catch {
        if (!isCancelled) setPendingApplications([]);
      } finally {
        if (!isCancelled) setApplicationsLoading(false);
      }
    };

    load();

    return () => {
      isCancelled = true;
    };
  }, [selectedJob, candidatePipelineTab]);

  const filteredCandidates = pendingApplications.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  // --- PAGINATION numbers ---
  const jobsTotalPages = Math.max(1, Math.ceil(jobsTotal / JOBS_PER_PAGE));
  const candidatesTotalPages = Math.max(1, Math.ceil(filteredCandidates.length / CANDIDATES_PER_PAGE));

  // --- JOBS: backend already paginates, so use as-is ---
  const paginatedJobs = jobs;

  const start = (candidatesPage - 1) * CANDIDATES_PER_PAGE;
  const end = candidatesPage * CANDIDATES_PER_PAGE;
  const paginatedCandidates = filteredCandidates.slice(start, end);

  const handleSetCandidatePipelineTab = (tab: CandidatePipelineTab) => {
    setCandidatePipelineTab(tab);
    setCandidatesPage(1);
  };

  // --- HANDLERS (simple functions that update state) ---

  function handleSearch(query: string) {
    setSearchQuery(query);
    setCandidatesPage(1);
  }

  function handleViewApplications(job: Job) {
    setSelectedJob(job);
    setCandidatePipelineTab("pending");
    setCandidatesPage(1);
  }

  async function handleViewResume() {
    if (!selectedJob || !selectedCandidate?.resumeUrl) return;
    setResumeLinkLoading(true);
    try {
      const url = await applicationsService.getResumeViewUrl(selectedJob.id, selectedCandidate.applicationId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      alert("Could not open resume. Please try again.");
    } finally {
      setResumeLinkLoading(false);
    }
  }

  function handleReject(candidate: Candidate) {
    setSelectedCandidate(candidate);
  }

  async function handleConfirmRejection(content: string) {
    if (!selectedJob || !selectedCandidate) return;
    try {
      await applicationsService.updateApplicationStatus(
        selectedJob.id,
        selectedCandidate.applicationId,
        { status: "REJECTED", rejectionEmailContent: content }
      );

      setPendingApplications((prev) =>
        prev.map((c) =>
          c.id === selectedCandidate.id ? { ...c, status: "REJECTED" as ExtendedApplicantStatus } : c
        )
      );
      showToast(`Rejection email saved for ${selectedCandidate.name}`, "success");
    } catch (e) {
      alert(extractApiError(e));
    }
  }

  async function handleShortlist(candidate: Candidate) {
    if (!selectedJob) return;
    try {
      await applicationsService.updateApplicationStatus(
        selectedJob.id,
        candidate.applicationId,
        { status: "SHORTLISTED" }
      );

      setPendingApplications((prev) =>
        prev.map((c) =>
          c.id === candidate.id ? { ...c, status: "SHORTLISTED" as ExtendedApplicantStatus } : c
        )
      );
    } catch {
      alert("Could not update application status. Please try again.");
    }
  }

  function handleSelectCandidate(candidate: Candidate) {
    setSelectedCandidate(candidate);
  }

  async function handleAIScorePendingCandidates() {
    if (!selectedJob) return;
    const unscoredCandidates = pendingApplications.filter(
      (c) => c.status === "PENDING" && (c.aiScore == null || c.aiScore === undefined)
    );
    if (unscoredCandidates.length === 0) return;
    setIsScoringPendingCandidates(true);
    try {
      const { scores } = await applicationsService.scoreCandidates(selectedJob.id, unscoredCandidates);
      setCandidateScores((prev) => {
        const next = { ...prev };
        scores.forEach((s) => {
          next[s.applicationId] = s.matchScore;
        });
        return next;
      });
      setScoredCandidateIds((prev) => {
        const next = new Set(prev);
        scores.forEach((s) => next.add(s.applicationId));
        return next;
      });
      await applicationsService.listApplications(selectedJob.id, { pipelineTab: candidatePipelineTab }).then((res) => {
        const candidates = res.data.map((a) => mapApiApplicationToCandidate(a, selectedJob.id));
        setPendingApplications(candidates);
      });
    } catch {
      // Error propagates - caller can show toast/alert if needed
    } finally {
      setIsScoringPendingCandidates(false);
    }
  }

  function getStatusBadge(status: string) {
    const label = status.replace("_", " ");
    const classMap: Record<string, string> = {
      PENDING: "py-1 px-3 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400",
      SHORTLISTED: "py-1 px-3 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400",
      INTERVIEW_SCHEDULED: "py-1 px-3 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300",
      RESCHEDULE_REQUESTED: "py-1 px-3 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-300",
      INTERVIEW_COMPLETE: "py-1 px-3 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300",
      COMPLETED: "py-1 px-3 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300",
      HIRED: "py-1 px-3 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300",
      REJECTED: "py-1 px-3 rounded-full text-xs font-semibold bg-red-500/20 text-red-400",
    };
    return {
      label,
      className: classMap[status] ?? "py-1 px-3 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-400",
    };
  }

  async function refreshSelectedJobApplications() {
    if (!selectedJob) return;
    try {
      const res = await applicationsService.listApplications(selectedJob.id, { pipelineTab: candidatePipelineTab });
      const candidates = res.data.map((a) => mapApiApplicationToCandidate(a, selectedJob.id));
      setPendingApplications(candidates);
    } catch {
      // ignore; keep last state
    }
  }


  

  return {
    jobs: paginatedJobs,
    candidatePipelineTab,
    setCandidatePipelineTab: handleSetCandidatePipelineTab,
    candidateCounts,
    jobsLoading,
    jobsPage,
    jobsTotalPages,
    pendingApplications,
    applicationsLoading,
    selectedJob,
    selectedCandidate,
    filteredCandidates,
    paginatedCandidates,
    candidatesPage,
    candidatesTotalPages,
    resumeLinkLoading,
    setJobsPage,
    setCandidatesPage,
    handleSearch,
    handleViewApplications,
    handleViewResume,
    handleReject,
    handleConfirmRejection,
    handleShortlist,
    handleSelectCandidate,
    handleAIScorePendingCandidates,
    getStatusBadge,
    refreshSelectedJobApplications,
    isScoringPendingCandidates,
    scoredCandidateIds,
    candidateScores,
  };
}
