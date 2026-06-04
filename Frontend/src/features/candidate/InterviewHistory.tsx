import React, { useState } from "react";
import CandidateNavHeader from "./CandidateNavHeader";
import { Button, Table, SearchInput, Pagination } from "../../components/common";
import { useCandidateInterviewHistory } from "../../hooks/candidate/useCandidateInterviewHistory";
import type { CandidateInterviewHistoryItem } from "../../services/candidateInterviewHistory.service";

const ITEMS_PER_PAGE = 10;

const InterviewHistory: React.FC = () => {
    const [searchValue, setSearchValue] = useState("");
    const [page, setPage] = useState(1);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const {
        interviews,
        total,
        totalPages,
        isLoading,
        error,
        selectedRow,
        setSelectedRow,
        expandedRows,
        toggleExpandRow,
        formatDate,
        formatTime,
    } = useCandidateInterviewHistory({
        search: searchValue,
        page,
        limit: ITEMS_PER_PAGE,
        sortOrder,
    });

    const columns = [
        {
            header: "Company",
            render: (i: CandidateInterviewHistoryItem) => (
                <button
                    type="button"
                    onClick={() => setSelectedRow(i.id)}
                    className={`text-sm ${selectedRow === i.id ? "text-indigo-300" : "text-slate-100"}`}
                >
                    {i.companyName ?? "—"}
                </button>
            ),
        },
        {
            header: "Interviewer",
            render: (i: CandidateInterviewHistoryItem) => (
                <span className="text-sm text-slate-100">{i.interviewerName ?? "—"}</span>
            ),
        },
        {
            header: "Date",
            render: (i: CandidateInterviewHistoryItem) => (
                <span className="text-sm text-slate-100">
                    {formatDate(i.createdAt)}
                </span>
            ),
        },
        {
            header: "Time",
            render: (i: CandidateInterviewHistoryItem) => (
                <span className="text-sm text-slate-100">
                    {formatTime(i.createdAt)}
                </span>
            ),
        },
        {
            header: "Interviewer Score",
            render: (i: CandidateInterviewHistoryItem) => {
                const interviewerScore = i.totalScore;
                return (
                    <span className="text-sm text-slate-100">
                        {typeof interviewerScore === "number" ? interviewerScore : interviewerScore}
                    </span>
                );
            },
        },
        {
            header: "Feedback",
            render: (i: CandidateInterviewHistoryItem) => {
                const feedbackText = i.feedback || "No feedback yet";
                const isExpanded = !!expandedRows[i.id];

                return (
                    <div className="flex items-start gap-3">
                        <div
                            className={`text-sm leading-snug text-slate-100 whitespace-pre-wrap break-words transition-[max-height] duration-200 ease-in-out ${
                                isExpanded ? "max-h-[2000px]" : "max-h-14 overflow-hidden"
                            }`}
                        >
                            {feedbackText}
                        </div>

                        {i.feedback && i.feedback.length > 120 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="px-2 py-1 text-xs font-semibold text-sky-300 hover:text-sky-200 hover:bg-sky-500/10"
                                onClick={() => toggleExpandRow(i.id)}
                                aria-expanded={isExpanded}
                            >
                                {isExpanded
                                    ? "Show less":"Show more"
                                }
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
            <div className="min-h-screen w-full bg-slate-950/90 border border-white/5 backdrop-blur-xl">
                <CandidateNavHeader title="INTERVIEW HISTORY" currentPage="history" />

                <div className="px-4 sm:px-6 lg:px-10 py-7">
                    <div>
                        {/* Search and Filter Controls (backend) */}
                        <div className="flex flex-wrap items-end gap-3 mb-4">
                            <div className="flex-1 min-w-[250px]">
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                    Search by company
                                </label>
                                <SearchInput
                                    placeholder="Search by company name..."
                                    onSearch={(value) => {
                                        setSearchValue(value);
                                        setPage(1);
                                    }}
                                />
                            </div>
                            <div className="min-w-[160px]">
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                    Filter
                                </label>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => {
                                        setSortOrder(e.target.value as "asc" | "desc");
                                        setPage(1);
                                    }}
                                    className="w-full py-2.5 px-3.5 rounded-lg border border-slate-600 bg-slate-900 text-sm text-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500"
                                >
                                    <option value="desc">Newest first</option>
                                    <option value="asc">Oldest first</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4">
                            {error && (
                                <p className="mb-4 text-sm text-red-400">{error}</p>
                            )}
                            <Table<CandidateInterviewHistoryItem>
                                columns={columns}
                                data={interviews}
                                rowKey={(item) => item.id}
                                emptyMessage={
                                    isLoading
                                        ? "Loading interview history..."
                                        : "No interviews match the selected filter."
                                }
                            />

                            {!isLoading && interviews.length > 0 && (
                                <Pagination
                                    page={page}
                                    totalPages={totalPages}
                                    onPageChange={setPage}
                                    leftContent={
                                        <span>
                                            Showing {(page - 1) * ITEMS_PER_PAGE + 1}–
                                            {Math.min(page * ITEMS_PER_PAGE, total)} of {total}
                                        </span>
                                    }
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InterviewHistory;
