import React, { useState } from "react";
import CandidateNavHeader from "./CandidateNavHeader";
import { Button, Table, SearchInput } from "../../components/common";
import { useCandidateInterviewHistory } from "../../hooks/candidate/useCandidateInterviewHistory";
import type { CandidateInterviewHistoryItem } from "../../services/candidateInterviewHistory.service";

const InterviewHistory: React.FC = () => {
    const {
        interviews,
        isLoading,
        error,
        selectedRow,
        setSelectedRow,
        expandedRows,
        toggleExpandRow,
        formatDate,
        formatTime,
    } = useCandidateInterviewHistory();

    const [searchValue, setSearchValue] = useState("");
    const [sortBy, setSortBy] = useState<"date" | "score">("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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
                        {/* Search and Sort Controls (UI only) */}
                        <div className="flex flex-wrap items-end gap-3 mb-4">
                            <div className="flex-1 min-w-[250px]">
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                    Search Interviews
                                </label>
                                <SearchInput
                                    placeholder="Search by company or interviewer..."
                                    onSearch={(value) => setSearchValue(value)}
                                />
                            </div>
                            <div className="min-w-[140px]">
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                    Sort By
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as "date" | "score")}
                                    className="w-full py-2.5 px-3.5 rounded-lg border border-slate-600 bg-slate-900 text-sm text-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500"
                                >
                                    <option value="date">Date</option>
                                    <option value="score">Score</option>
                                </select>
                            </div>
                            <div className="min-w-[130px]">
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                    Order
                                </label>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                                    className="w-full py-2.5 px-3.5 rounded-lg border border-slate-600 bg-slate-900 text-sm text-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500"
                                >
                                    <option value="desc">Newest First</option>
                                    <option value="asc">Oldest First</option>
                                </select>
                            </div>
                            {(searchValue || sortBy !== "date" || sortOrder !== "desc") && (
                                <Button
                                    variant="ghostOutline"
                                    onClick={() => {
                                        setSearchValue("");
                                        setSortBy("date");
                                        setSortOrder("desc");
                                    }}
                                    className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium"
                                >
                                    Reset
                                </Button>
                            )}
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
                        </div>

                       
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InterviewHistory;
