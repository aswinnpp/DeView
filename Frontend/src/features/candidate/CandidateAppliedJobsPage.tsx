import React, { useState } from "react";
import CandidateNavHeader from "./CandidateNavHeader";
import { SearchInput, Pagination } from "../../components/common";
import { useCandidateApplications, type ApplicationWithJob } from "../../hooks/candidate/useCandidateApplications";

const ITEMS_PER_PAGE = 2;

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

    if (selectedApplication) {
        return (
            <div className="min-h-screen w-full bg-linear-to-br from-[#111318] to-[#0b0f17] font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[rgba(255,255,255,0.95)]">
                <div className="w-full min-h-screen bg-[rgba(15,15,25,0.96)] border border-[rgba(255,255,255,0.03)] backdrop-blur-[10px] overflow-hidden">
                    <CandidateNavHeader title="APPLICATION DETAILS" currentPage="applied" />

                    <div className="pt-[72px] py-7 px-4 sm:px-6 lg:px-12 pb-20 max-md:pb-12">
                        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">
                                        {selectedApplication.job?.companyName || "Company"}
                                    </h3>
                                    <p className="text-sm text-slate-300">
                                        {selectedApplication.job?.title || "Job Title"}
                                    </p>
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
                                {selectedApplication.job?.location && (
                                    <div className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                        <span>{selectedApplication.job.location}</span>
                                    </div>
                                )}
                                {selectedApplication.job?.jobType && (
                                    <div className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                        <span>{selectedApplication.job.jobType}</span>
                                    </div>
                                )}
                                {selectedApplication.job?.salary && (
                                    <div className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                        <span>{selectedApplication.job.salary}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                    <span>Applied: {formatDate(selectedApplication.createdAt)}</span>
                                </div>
                            </div>

                            {/* Job Description */}
                            {selectedApplication.job?.description && (
                                <div className="mt-6">
                                    <h4 className="mb-3 text-sm font-semibold text-slate-100">Job Description</h4>
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-400">
                                        {selectedApplication.job.description}
                                    </p>
                                </div>
                            )}

                            {/* Requirements */}
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
                                        <p className="text-sm leading-relaxed text-slate-400">
                                            {selectedApplication.job.requirements}
                                        </p>
                                    </div>
                                )
                            )}

                            {/* Skills */}
                            {selectedApplication.job?.skills && (
                                Array.isArray(selectedApplication.job.skills) ? (
                                    selectedApplication.job.skills.length > 0 && (
                                        <div className="mt-5">
                                            <h4 className="mb-3 text-sm font-semibold text-slate-100">Required Skills</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedApplication.job.skills.map((skill, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-medium text-cyan-300"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <div className="mt-5">
                                        <h4 className="mb-3 text-sm font-semibold text-slate-100">Required Skills</h4>
                                        <p className="text-sm text-slate-400">
                                            {selectedApplication.job.skills}
                                        </p>
                                    </div>
                                )
                            )}

                            {/* Cover Letter */}
                            {selectedApplication.coverLetter && (
                                <div className="mt-6">
                                    <h4 className="mb-2 text-sm font-semibold text-slate-100">Your Cover Letter</h4>
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-400">
                                        {selectedApplication.coverLetter}
                                    </p>
                                </div>
                            )}

                            {/* Timeline */}
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
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-linear-to-br from-[#111318] to-[#0b0f17] font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[rgba(255,255,255,0.95)]">
            <div className="w-full min-h-screen bg-[rgba(15,15,25,0.96)] border border-[rgba(255,255,255,0.03)] backdrop-blur-[10px] overflow-hidden">
                <CandidateNavHeader title="APPLIED JOBS" currentPage="applied" />

                <div className="pt-[72px] py-7 px-4 sm:px-6 lg:px-12 pb-20 max-md:pb-12">
                    {/* Search and Filter Section - always visible so SearchInput doesn't unmount on loading */}
                    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                        {/* Search */}
                        <div className="flex items-end gap-3">
                            <div className="w-52">
                                <label className="mb-1 block text-[11px] font-semibold text-slate-400">
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
                        </div>

                        {/* Status + Sort Filter */}
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="w-32">
                                <label className="mb-1 block text-[11px] font-semibold text-slate-400">
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full cursor-pointer rounded-md border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-slate-100 focus:border-indigo-400 focus:outline-none"
                                >
                                    <option value="all">All Status</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="SHORTLISTED">Shortlisted</option>
                                    <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                                    <option value="INTERVIEW_COMPLETE">Interview Complete</option>
                                    <option value="HIRED">Hired</option>
                                    <option value="REJECTED">Rejected</option>
                                </select>
                            </div>

                            <div className="w-32">
                                <label className="mb-1 block text-[11px] font-semibold text-slate-400">
                                    Date order
                                </label>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => {
                                        setSortOrder(e.target.value as "asc" | "desc");
                                        setCurrentPage(1);
                                    }}
                                    className="w-full cursor-pointer rounded-md border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-slate-100 focus:border-indigo-400 focus:outline-none"
                                >
                                    <option value="desc">Newest first</option>
                                    <option value="asc">Oldest first</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="py-16 text-center text-slate-400 text-sm">
                            Loading your applications...
                        </div>
                    ) : totalApplications === 0 && !searchQuery && statusFilter === "all" ? (
                        <div className="py-16 text-center text-slate-400">
                            <h3 className="mb-1 text-base font-semibold text-slate-100">No Applications Yet</h3>
                            <p className="text-sm">Start applying to jobs to track your applications here.</p>
                        </div>
                    ) : totalApplications === 0 ? (
                        <div className="py-16 text-center text-slate-400">
                            <h3 className="mb-1 text-base font-semibold text-slate-100">No Applications Found</h3>
                            <p className="text-sm">No applications match your search criteria.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                            {/* List Header */}
                            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                                <div>
                                    <h3 className="text-base font-semibold text-white">
                                        Your Applications
                                    </h3>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Track the status of your job applications
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xs text-slate-300">
                                        {totalApplications} application{totalApplications !== 1 ? 's' : ''}
                                    </span>
                                    <span className="text-[11px] text-slate-500">
                                        Page {currentPage} of {totalPages || 1}
                                    </span>
                                </div>
                            </div>

                            {/* Application List */}
                            <div>
                                {paginatedApplications.map((application, index) => (
                                    <div
                                        key={application.id}
                                        onClick={() => setSelectedApplication(application)}
                                        className={`flex cursor-pointer items-start gap-4 px-5 py-4 transition-colors ${
                                            index < paginatedApplications.length - 1 ? "border-b border-white/5" : ""
                                        } hover:bg-white/5`}
                                    >
                                        {/* Company Logo */}
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white">
                                            {(application.job?.companyName || 'C').charAt(0).toUpperCase()}
                                        </div>

                                        {/* Job Info */}
                                        <div className="min-w-0 flex-1">
                                            <h4 className="mb-1 cursor-pointer text-sm font-semibold text-violet-300 transition-colors hover:text-violet-200">
                                                {application.job?.title || 'Job Title'}
                                            </h4>

                                            <p className="mb-1 text-[13px] text-slate-100">
                                                {application.job?.companyName || 'Company'}
                                                {application.job?.location && (
                                                    <>
                                                        <span className="mx-1 text-slate-600">•</span>
                                                        {application.job.location}
                                                    </>
                                                )}
                                                {application.job?.jobType && (
                                                    <>
                                                        <span className="mx-1 text-slate-600">•</span>
                                                        <span className="text-slate-400">{application.job.jobType}</span>
                                                    </>
                                                )}
                                            </p>

                                            <p className="flex items-center gap-2 text-[11px] text-slate-500">
                                                Applied {formatDate(application.createdAt)}
                                                <span className="text-slate-600">•</span>
                                                <span
                                                    className="font-medium"
                                                    style={{ color: getStatusColor(application.status).color }}
                                                >
                                                    {formatStatus(application.status)}
                                                </span>
                                            </p>
                                        </div>

                                        <div className="self-center text-lg text-slate-500">
                                            →
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="border-t border-white/10 px-5 py-3">
                                <Pagination
                                    page={currentPage}
                                    totalPages={totalPages || 1}
                                    onPageChange={(nextPage) => setCurrentPage(nextPage)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CandidateAppliedJobsPage;
