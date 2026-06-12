import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CandidateNavHeader from "./CandidateNavHeader";
import { Button, SearchInput, Pagination, Table } from "../../components/common";
import { useCandidateApplications, type ApplicationWithJob } from "../../hooks/candidate/useCandidateApplications";

const ITEMS_PER_PAGE = 2;

const CandidateAppliedJobsPage: React.FC = () => {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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
            case "pending":
            case "applied":
                return { bg: "rgba(251, 191, 36, 0.15)", color: "#fbbf24", border: "rgba(251, 191, 36, 0.3)" };
            case "shortlisted":
                return { bg: "rgba(6, 182, 212, 0.15)", color: "#06b6d4", border: "rgba(6, 182, 212, 0.3)" };
            case "in_interview":
            case "interview":
                return { bg: "rgba(139, 92, 246, 0.15)", color: "#a78bfa", border: "rgba(139, 92, 246, 0.3)" };
            case "offered":
                return { bg: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "rgba(16, 185, 129, 0.3)" };
            case "accepted":
                return { bg: "rgba(16, 185, 129, 0.2)", color: "#10b981", border: "rgba(16, 185, 129, 0.4)" };
            case "rejected":
                return { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "rgba(239, 68, 68, 0.3)" };
            default:
                return { bg: "rgba(148, 163, 184, 0.15)", color: "#94a3b8", border: "rgba(148, 163, 184, 0.3)" };
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatStatus = (status: string) => {
        return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    };

    const tableColumns = [
        {
            header: "Job",
            cellClassName: "min-w-[140px]",
            render: (app: ApplicationWithJob) => (
                <div className="min-w-0">
                    <div className="font-semibold text-slate-100 truncate">{app.job?.title || "Job title"}</div>
                    {app.job?.location && (
                        <div className="text-xs text-slate-500 truncate mt-0.5">{app.job.location}</div>
                    )}
                </div>
            ),
        },
        {
            header: "Company",
            cellClassName: "min-w-[120px]",
            render: (app: ApplicationWithJob) => (
                <span className="text-slate-300 truncate block">{app.job?.companyName || "—"}</span>
            ),
        },
        {
            header: "Applied",
            render: (app: ApplicationWithJob) => (
                <span className="text-slate-400 text-sm whitespace-nowrap">{formatDate(app.createdAt)}</span>
            ),
        },
        {
            header: "Status",
            render: (app: ApplicationWithJob) => (
                <span
                    className="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium border whitespace-nowrap"
                    style={{
                        background: getStatusColor(app.status).bg,
                        color: getStatusColor(app.status).color,
                        borderColor: getStatusColor(app.status).border,
                    }}
                >
                    {formatStatus(app.status)}
                </span>
            ),
        },
        {
            header: "",
            headerClassName: "w-[88px]",
            cellClassName: "w-[88px]",
            render: (app: ApplicationWithJob) => (
                <Button
                    type="button"
                    variant="primary"
                    className="!py-1.5 !px-3 text-xs"
                    onClick={() => navigate(`/candidate/applied/${app.id}`)}
                >
                    View
                </Button>
            ),
        },
    ];

    return (
        <div className="min-h-screen w-full bg-linear-to-br from-[#111318] to-[#0b0f17] font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[rgba(255,255,255,0.95)] overflow-x-hidden">
            <div className="min-h-screen w-full bg-[rgba(15,15,25,0.96)] border border-[rgba(255,255,255,0.03)] backdrop-blur-[10px] flex flex-col">
                <CandidateNavHeader title="APPLIED JOBS" currentPage="applied" />

                <div className="pt-[72px] px-3 sm:px-6 pb-6 sm:pb-8">
                    <div className="">
                    <div className="shrink-0 py-4 border-b border-[rgba(255,255,255,0.06)]">
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div className="w-full md:max-w-[320px]">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto md:flex md:flex-wrap md:items-end">
                                <div className="w-full sm:w-auto sm:min-w-[160px]">
                                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-[rgba(148,163,184,0.9)] mb-1.5">
                                        Status
                                    </label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full rounded-lg border border-[rgba(148,163,184,0.45)] bg-[rgba(15,23,42,0.98)] px-3 py-2 text-xs sm:text-sm text-slate-100 outline-none focus:border-brand-primary focus:ring-2 focus:ring-[rgba(102,126,234,0.4)] cursor-pointer"
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

                                <div className="w-full sm:w-auto sm:min-w-[160px]">
                                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-[rgba(148,163,184,0.9)] mb-1.5">
                                        Date order
                                    </label>
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => {
                                            setSortOrder(e.target.value as "asc" | "desc");
                                            setCurrentPage(1);
                                        }}
                                        className="w-full rounded-lg border border-[rgba(148,163,184,0.45)] bg-[rgba(15,23,42,0.98)] px-3 py-2 text-xs sm:text-sm text-slate-100 outline-none focus:border-brand-primary focus:ring-2 focus:ring-[rgba(102,126,234,0.4)] cursor-pointer"
                                    >
                                        <option value="desc">Newest first</option>
                                        <option value="asc">Oldest first</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm py-20">
                            Loading your applications...
                        </div>
                    ) : totalApplications === 0 && !searchQuery && statusFilter === "all" ? (
                        <div className="flex-1 flex items-center justify-center px-6 text-center text-slate-400 py-20">
                            <div>
                                <h3 className="mb-1 text-base font-semibold text-slate-100">No Applications Yet</h3>
                                <p className="text-sm">Start applying to jobs to track your applications here.</p>
                            </div>
                        </div>
                    ) : totalApplications === 0 ? (
                        <div className="flex-1 flex items-center justify-center px-6 text-center text-slate-400 py-20">
                            <div>
                                <h3 className="mb-1 text-base font-semibold text-slate-100">No Applications Found</h3>
                                <p className="text-sm">No applications match your search criteria.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="shrink-0 flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] py-3 gap-3">
                                <div className="text-xs text-slate-300">
                                    {totalApplications} application{totalApplications !== 1 ? "s" : ""}
                                </div>
                                <div className="text-[11px] text-slate-500 whitespace-nowrap">
                                    Page {currentPage} of {totalPages || 1}
                                </div>
                            </div>
                            <div className="py-4 w-full">
                                <div className="hidden md:block">
                                    <Table<ApplicationWithJob>
                                        columns={tableColumns}
                                        data={paginatedApplications}
                                        rowKey={(app) => app.id}
                                        emptyMessage="No applications to show."
                                    />
                                </div>

                                <div className="md:hidden space-y-3">
                                    {paginatedApplications.map((app) => (
                                        <div
                                            key={app.id}
                                            className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(15,23,42,0.65)] p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h4 className="m-0 text-sm font-semibold text-slate-100 truncate">
                                                        {app.job?.title || "Job title"}
                                                    </h4>
                                                    <p className="m-0 mt-1 text-xs text-slate-400 truncate">
                                                        {app.job?.companyName || "—"}
                                                    </p>
                                                </div>
                                                <span
                                                    className="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium border whitespace-nowrap"
                                                    style={{
                                                        background: getStatusColor(app.status).bg,
                                                        color: getStatusColor(app.status).color,
                                                        borderColor: getStatusColor(app.status).border,
                                                    }}
                                                >
                                                    {formatStatus(app.status)}
                                                </span>
                                            </div>

                                            <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                                                <p className="m-0">
                                                    <span className="text-slate-500">Location:</span>{" "}
                                                    {app.job?.location || "—"}
                                                </p>
                                                <p className="m-0">
                                                    <span className="text-slate-500">Applied:</span>{" "}
                                                    {formatDate(app.createdAt)}
                                                </p>
                                            </div>

                                            <div className="mt-3">
                                                <Button
                                                    type="button"
                                                    variant="primary"
                                                    className="w-full !py-2 !px-3 text-xs"
                                                    onClick={() => navigate(`/candidate/applied/${app.id}`)}
                                                >
                                                    View Application
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="shrink-0 mt-auto pt-4 border-t border-[rgba(255,255,255,0.06)]">
                        {totalPages > 0 && paginatedApplications.length > 0 && (
                            <Pagination
                                page={currentPage}
                                totalPages={totalPages || 1}
                                onPageChange={(nextPage) => setCurrentPage(nextPage)}
                            />
                        )}
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateAppliedJobsPage;
