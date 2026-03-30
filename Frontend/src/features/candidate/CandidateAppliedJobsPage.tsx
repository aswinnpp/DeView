import React, { useEffect, useState } from "react";
import CandidateNavHeader from "./CandidateNavHeader";
import { SearchInput, Pagination } from "../../components/common";
import { useCandidateApplications, type ApplicationWithJob } from "../../hooks/candidate/useCandidateApplications";
import type { ApplicationItem } from "../../services/applications.service";

const ITEMS_PER_PAGE = 2;
type InterviewRoundLike =
    | NonNullable<ApplicationItem["interviewDetails"]>
    | NonNullable<NonNullable<ApplicationItem["interviewRounds"]>[number]>;

const CandidateAppliedJobsPage: React.FC = () => {
    const [selectedApplication, setSelectedApplication] = useState<ApplicationWithJob | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const {
        applications: paginatedApplications,
        totalApplications,
        totalPages,
        isLoading,
    } = useCandidateApplications({
        status: statusFilter,
        search: searchQuery,
        page: currentPage,
        itemsPerPage: ITEMS_PER_PAGE,
        sortOrder,
    });

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
            case 'applied':
                return { bg: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' };
            case 'shortlisted':
                return { bg: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', border: 'rgba(6, 182, 212, 0.3)' };
            case 'in_interview':
            case 'interview':
                return { bg: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' };
            case 'offered':
                return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
            case 'accepted':
                return { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: 'rgba(16, 185, 129, 0.4)' };
            case 'rejected':
                return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
            default:
                return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatStatus = (status: string) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    const formatInterviewType = (type?: string) => {
        if (type === "CALL") return "Call";
        if (type === "F2F") return "Face to Face";
        if (type === "ONLINE") return "Online";
        return "Online";
    };

    useEffect(() => {
        if (!paginatedApplications.length) {
            setSelectedApplication(null);
            return;
        }

        if (!selectedApplication || !paginatedApplications.some((app) => app.id === selectedApplication.id)) {
            setSelectedApplication(paginatedApplications[0]);
        }
    }, [paginatedApplications, selectedApplication]);

    return (
        <div className="min-h-screen w-full bg-linear-to-br from-[#111318] to-[#0b0f17] font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[rgba(255,255,255,0.95)] overflow-x-hidden lg:h-screen lg:overflow-hidden">
            <div className="min-h-screen w-full bg-[rgba(15,15,25,0.96)] border border-[rgba(255,255,255,0.03)] backdrop-blur-[10px] flex flex-col lg:h-full lg:overflow-hidden">
                <CandidateNavHeader title="APPLIED JOBS" currentPage="applied" />

                <div className="pt-[72px] flex flex-col lg:flex-row flex-1 lg:overflow-hidden">
                    <div className="w-full lg:w-[55%] flex flex-col border-b border-[rgba(255,255,255,0.06)] lg:border-b-0 lg:border-r lg:border-[rgba(255,255,255,0.06)] lg:overflow-hidden">
                        <div className="shrink-0 px-4 py-4 sm:px-5 border-b border-[rgba(255,255,255,0.06)]">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div className="w-full sm:max-w-[300px]">
                                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-[rgba(148,163,184,0.9)] mb-1.5">
                                    Search
                                </label>
                                <SearchInput
                                    placeholder="Search jobs..."
                                    onSearch={(value) => {
                                        setSearchQuery(value);
                                        setCurrentPage(1);
                                    }}
                                />
                                </div>
                                <div className="flex flex-wrap items-end gap-3">
                                    <div className="w-[120px]">
                                        <label className="block text-[11px] font-semibold uppercase tracking-wide text-[rgba(148,163,184,0.9)] mb-1.5">
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full rounded-lg border border-[rgba(148,163,184,0.45)] bg-[rgba(15,23,42,0.98)] px-2.5 py-1.5 text-[11px] text-slate-100 outline-none focus:border-brand-primary focus:ring-2 focus:ring-[rgba(102,126,234,0.4)] cursor-pointer"
                                >
                                    <option value="all">All Status</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="SHORTLISTED">Shortlisted</option>
                                    <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                                    <option value="INTERVIEW_COMPLETE">Interview Complete</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="HIRED">Hired</option>
                                    <option value="REJECTED">Rejected</option>
                                </select>
                            </div>

                                    <div className="w-[120px]">
                                        <label className="block text-[11px] font-semibold uppercase tracking-wide text-[rgba(148,163,184,0.9)] mb-1.5">
                                    Date order
                                </label>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => {
                                        setSortOrder(e.target.value as "asc" | "desc");
                                        setCurrentPage(1);
                                    }}
                                    className="w-full rounded-lg border border-[rgba(148,163,184,0.45)] bg-[rgba(15,23,42,0.98)] px-2.5 py-1.5 text-[11px] text-slate-100 outline-none focus:border-brand-primary focus:ring-2 focus:ring-[rgba(102,126,234,0.4)] cursor-pointer"
                                >
                                    <option value="desc">Newest first</option>
                                    <option value="asc">Oldest first</option>
                                </select>
                            </div>
                                </div>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                            Loading your applications...
                        </div>
                    ) : totalApplications === 0 && !searchQuery && statusFilter === "all" ? (
                            <div className="flex-1 flex items-center justify-center px-6 text-center text-slate-400">
                            <h3 className="mb-1 text-base font-semibold text-slate-100">No Applications Yet</h3>
                            <p className="text-sm">Start applying to jobs to track your applications here.</p>
                        </div>
                    ) : totalApplications === 0 ? (
                            <div className="flex-1 flex items-center justify-center px-6 text-center text-slate-400">
                            <h3 className="mb-1 text-base font-semibold text-slate-100">No Applications Found</h3>
                            <p className="text-sm">No applications match your search criteria.</p>
                        </div>
                    ) : (
                            <>
                                <div className="shrink-0 flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] px-5 py-3">
                                    <div className="text-xs text-slate-300">
                                        {totalApplications} application{totalApplications !== 1 ? 's' : ''}
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                        Page {currentPage} of {totalPages || 1}
                                    </div>
                                </div>
                                <div className="px-4 py-3 space-y-3 lg:flex-1 lg:overflow-y-auto">
                                {paginatedApplications.map((application, index) => (
                                    <button
                                        type="button"
                                        key={application.id}
                                        onClick={() => setSelectedApplication(application)}
                                        className={`w-full text-left rounded-xl border px-4 py-3.5 transition-all duration-200 cursor-pointer ${
                                            selectedApplication?.id === application.id
                                                ? 'border-brand-primary bg-[rgba(102,126,234,0.08)] border-l-[3px] border-l-brand-primary'
                                                : 'border-[rgba(255,255,255,0.06)] bg-[rgba(15,23,42,0.6)] hover:bg-[rgba(30,41,59,0.7)] hover:border-[rgba(255,255,255,0.12)]'
                                        } ${index < paginatedApplications.length - 1 ? "" : ""}`}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <h4 className="m-0 text-[14px] font-semibold text-white truncate">
                                                {application.job?.title || 'Job Title'}
                                            </h4>
                                            <p className="m-0 mt-0.5 text-[12px] text-[rgba(148,163,184,0.9)] truncate">
                                                {application.job?.companyName || 'Company'}
                                                {application.job?.location && (
                                                    <>
                                                        <span className="mx-1.5">•</span>
                                                        {application.job.location}
                                                    </>
                                                )}
                                                {application.job?.jobType && (
                                                    <>
                                                        <span className="mx-1.5">•</span>
                                                        {application.job.jobType}
                                                    </>
                                                )}
                                                <span className="mx-1.5">•</span>
                                                Applied {formatDate(application.createdAt)}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span
                                                    className="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium border"
                                                    style={{
                                                        background: getStatusColor(application.status).bg,
                                                        color: getStatusColor(application.status).color,
                                                        borderColor: getStatusColor(application.status).border,
                                                    }}
                                                >
                                                    {formatStatus(application.status)}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            </>
                        )}

                        <div className="shrink-0 mt-auto px-4 py-3 border-t border-[rgba(255,255,255,0.06)]">
                            {totalPages > 0 && paginatedApplications.length > 0 && (
                                <Pagination
                                    page={currentPage}
                                    totalPages={totalPages || 1}
                                    onPageChange={(nextPage) => setCurrentPage(nextPage)}
                                />
                            )}
                        </div>
                    </div>

                    <div className="w-full lg:w-[45%] bg-[rgba(10,12,20,0.4)] lg:overflow-y-auto">
                        {selectedApplication ? (
                            <div className="px-5 py-5 lg:px-7 lg:py-6">
                                <h2 className="m-0 text-base font-semibold text-[rgba(226,232,240,0.9)] mb-5">Application Detail</h2>
                                <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(15,23,42,0.7)] px-5 py-5">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{selectedApplication.job?.companyName || "Company"}</h3>
                                        <p className="text-sm text-slate-300">{selectedApplication.job?.title || "Job Title"}</p>
                                    </div>
                                    <span
                                        className="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
                                        style={{
                                            background: getStatusColor(selectedApplication.status).bg,
                                            color: getStatusColor(selectedApplication.status).color,
                                            borderColor: getStatusColor(selectedApplication.status).border,
                                        }}
                                    >
                                        {formatStatus(selectedApplication.status)}
                                    </span>
                                </div>

                                <div className="mb-6 grid gap-3 text-sm text-slate-100 sm:grid-cols-2">
                                    {selectedApplication.job?.location && <div>{selectedApplication.job.location}</div>}
                                    {selectedApplication.job?.jobType && <div>{selectedApplication.job.jobType}</div>}
                                    {selectedApplication.job?.salary && <div>{selectedApplication.job.salary}</div>}
                                    <div>Applied: {formatDate(selectedApplication.createdAt)}</div>
                                </div>

                                {selectedApplication.job?.description && (
                                    <div className="mt-6">
                                        <h4 className="mb-3 text-sm font-semibold text-slate-100">Job Description</h4>
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-400">{selectedApplication.job.description}</p>
                                    </div>
                                )}

                                {selectedApplication.job?.requirements && (
                                    Array.isArray(selectedApplication.job.requirements) ? (
                                        selectedApplication.job.requirements.length > 0 && (
                                            <div className="mt-5">
                                                <h4 className="mb-3 text-sm font-semibold text-slate-100">Requirements</h4>
                                                <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-400">
                                                    {selectedApplication.job.requirements.map((req, idx) => (
                                                        <li key={idx}>{req}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )
                                    ) : (
                                        <div className="mt-5">
                                            <h4 className="mb-3 text-sm font-semibold text-slate-100">Requirements</h4>
                                            <p className="text-sm leading-relaxed text-slate-400">{selectedApplication.job.requirements}</p>
                                        </div>
                                    )
                                )}

                                {selectedApplication.job?.skills && (
                                    Array.isArray(selectedApplication.job.skills) ? (
                                        selectedApplication.job.skills.length > 0 && (
                                            <div className="mt-5">
                                                <h4 className="mb-3 text-sm font-semibold text-slate-100">Required Skills</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedApplication.job.skills.map((skill, idx) => (
                                                        <span key={idx} className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-medium text-cyan-300">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        <div className="mt-5">
                                            <h4 className="mb-3 text-sm font-semibold text-slate-100">Required Skills</h4>
                                            <p className="text-sm text-slate-400">{selectedApplication.job.skills}</p>
                                        </div>
                                    )
                                )}

                                {selectedApplication.coverLetter && (
                                    <div className="mt-6">
                                        <h4 className="mb-2 text-sm font-semibold text-slate-100">Your Cover Letter</h4>
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-400">{selectedApplication.coverLetter}</p>
                                    </div>
                                )}

                                {(() => {
                                    const rounds = (selectedApplication.interviewRounds?.length
                                        ? selectedApplication.interviewRounds
                                        : selectedApplication.interviewDetails
                                            ? [selectedApplication.interviewDetails]
                                            : []);
                                    const completedRounds = new Set(selectedApplication.completedRounds ?? []);
                                    const isCompletedRound = (r: InterviewRoundLike) =>
                                        Boolean(r.feedback) || r.totalScore != null || (typeof r.round === "string" && completedRounds.has(r.round));
                                    const displayRounds = (rounds as InterviewRoundLike[]).filter((r) => isCompletedRound(r) || Boolean(r.interviewerAccepted));
                                    const shouldShow =
                                        (selectedApplication.status === "INTERVIEW_SCHEDULED" ||
                                            selectedApplication.status === "RESCHEDULE_REQUESTED" ||
                                            selectedApplication.status === "INTERVIEW_COMPLETE" ||
                                            selectedApplication.status === "COMPLETED" ||
                                            selectedApplication.status === "HIRED") &&
                                        displayRounds.length > 0;
                                    if (!shouldShow) return null;
                                    return (
                                        <div className="mt-6">
                                            <h4 className="mb-3 text-sm font-semibold text-violet-200">Interviews ({displayRounds.length})</h4>
                                            <div className="space-y-4">
                                                {displayRounds.map((r, idx: number) => (
                                                    <div key={idx} className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
                                                        <div className="mb-2 text-xs font-semibold text-violet-300">Round {idx + 1}: {r.round}</div>
                                                        <div className="grid gap-3 text-sm text-slate-100 sm:grid-cols-2">
                                                            <div>
                                                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Interviewer</div>
                                                                <div className="mt-1 text-slate-100">
                                                                    {r.interviewer}
                                                                    {r.interviewerEmail ? ` (${r.interviewerEmail})` : ""}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Date & Time</div>
                                                                <div className="mt-1 text-slate-100">{formatDate(r.scheduledDate)} at {r.scheduledTime}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Interview Type</div>
                                                                <div className="mt-1 text-slate-100">{formatInterviewType(r.interviewType ?? selectedApplication.latestFeedback?.interviewType)}</div>
                                                            </div>
                                                            {(r.interviewType ?? selectedApplication.latestFeedback?.interviewType) === "F2F" &&
                                                            (r.interviewLocation ?? selectedApplication.latestFeedback?.interviewLocation) ? (
                                                                <div>
                                                                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Location</div>
                                                                    <div className="mt-1 text-slate-100">{r.interviewLocation ?? selectedApplication.latestFeedback?.interviewLocation}</div>
                                                                </div>
                                                            ) : null}
                                                            {r.totalScore != null && (
                                                                <div>
                                                                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Score</div>
                                                                    <div className="mt-1 text-slate-100">{r.totalScore}/10</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {r.feedback && (
                                                            <div className="mt-3">
                                                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Feedback</div>
                                                                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{r.feedback}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {selectedApplication.latestFeedback &&
                                    !selectedApplication.interviewRounds?.length &&
                                    !selectedApplication.interviewDetails?.feedback && (
                                    <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                                        <h4 className="mb-3 text-sm font-semibold text-emerald-200">Interviewer Feedback</h4>
                                        <div className="grid gap-3 text-sm text-slate-100 sm:grid-cols-2">
                                            <div>
                                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Round</div>
                                                <div className="mt-1 text-slate-100">{selectedApplication.latestFeedback.round || "—"}</div>
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Score</div>
                                                <div className="mt-1 text-slate-100">{selectedApplication.latestFeedback.totalScore}/10</div>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Feedback</div>
                                            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{selectedApplication.latestFeedback.feedback || "—"}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
                                    <h4 className="mb-3 text-sm font-semibold text-slate-100">Application Timeline</h4>
                                    <div className="flex flex-col gap-2 text-xs text-slate-400">
                                        <div className="flex items-center justify-between">
                                            <span>Applied</span>
                                            <span>{formatDate(selectedApplication.createdAt)}</span>
                                        </div>
                                        {selectedApplication.updatedAt && selectedApplication.updatedAt !== selectedApplication.createdAt && (
                                            <div className="flex items-center justify-between">
                                                <span>Last Updated</span>
                                                <span>{formatDate(selectedApplication.updatedAt)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-sm text-[rgba(148,163,184,0.7)]">Select an application to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateAppliedJobsPage;
