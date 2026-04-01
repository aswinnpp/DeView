import { Button, Table, Pagination, SearchInput } from "../../components/common";
import { useInterviewerAssignments } from "../../hooks/interviewer";
import type { InterviewerAssignmentItem } from "../../services/interviewerAssignments.service";
import { interviewerAssignmentsService } from "../../services/interviewerAssignments.service";
import { useState } from "react";
import { MESSAGES } from "../../constants/messages";

const selectClass =
  "w-full py-2 px-3.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer";

const getInterviewTypeLabel = (type?: string) => {
  if (type === "CALL") return "Call";
  if (type === "F2F") return "Face to Face";
  return "Online";
};


const InterviewerAssignments = () => {
  const [resumeLoadingId, setResumeLoadingId] = useState<string | null>(null);
  const {
    filtered,
    pendingCount,
    total,
    totalPages,
    page,
    setPage,
    emptyMessage,
    isLoading,
    error,
    isAccepting,
    isRejecting,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    rejectModalOpen,
    rejectInterview,
    rejectionReason,
    setRejectionReason,
    closeRejectModal,
    openRejectModal,
    submitReject,
    handleAccept,
    formatTime,
    formatDate,
    ITEMS_PER_PAGE,
  } = useInterviewerAssignments();

  const handleViewResume = async (interviewId: string) => {
    try {
      setResumeLoadingId(interviewId);
      const url = await interviewerAssignmentsService.getResumeViewUrl(interviewId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      window.alert(MESSAGES.UNABLE_TO_LOAD_RESUME);
    } finally {
      setResumeLoadingId(null);
    }
  };

  const columns = [
    {
      header: "Candidate",
      render: (item: InterviewerAssignmentItem) => (
        <div>
          <div className="font-semibold text-slate-200">{item.candidateName}</div>
          <div className="text-xs text-slate-500">{item.candidateEmail}</div>
        </div>
      ),
    },
    {
      header: "Role / JD",
      render: (item: InterviewerAssignmentItem) => (
        <span className="text-slate-300">{item.jobTitle || "—"}</span>
      ),
    },
    {
      header: "Date",
      render: (item: InterviewerAssignmentItem) => (
        <span className="text-sm text-slate-400">{formatDate(item.date)}</span>
      ),
    },
    {
      header: "Time",
      render: (item: InterviewerAssignmentItem) => (
        <span className="font-medium text-blue-400">
          {formatTime(item.startTime)}
        </span>
      ),
    },
    {
      header: "Round",
      render: (item: InterviewerAssignmentItem) => (
        <span className="inline-block py-0.5 px-2 rounded text-[11px] font-semibold bg-violet-500/20 text-violet-300">
          {item.interviewRound}
        </span>
      ),
    },
    {
      header: "Type",
      render: (item: InterviewerAssignmentItem) => (
        <div className="text-xs text-slate-300">
          <p className="m-0">{getInterviewTypeLabel(item.interviewType)}</p>
          {item.interviewType === "F2F" && item.interviewLocation ? (
            <p className="m-0 text-[11px] text-slate-500">{item.interviewLocation}</p>
          ) : null}
        </div>
      ),
    },
    
    {
      header: "Actions",
      render: (item: InterviewerAssignmentItem) => {
        const viewBtn = (
          <Button
            variant="secondary"
            className="!py-1.5 !px-3 text-xs !bg-slate-700 "
            onClick={() => handleViewResume(item.id)}
            disabled={resumeLoadingId === item.id}
          >
            {resumeLoadingId === item.id ? "Loading..." : "View Resume"}
          </Button>
        );

        if (item.status === "pending" || item.status === "scheduled")
          return (
            <div className="flex gap-1 ">
              {viewBtn}
              <Button
                variant="primary"
                className="!py-1.5 !px-3 text-xs "
                onClick={() => handleAccept(item.id)}
                disabled={isAccepting}
              >
                {isAccepting ? "Accepting..." : "Accept"}
              </Button>
              <Button
                variant="amber"
                onClick={() => openRejectModal(item)}
                disabled={isAccepting}
              >
                Reschedule
              </Button>
            </div>
          );
        if (item.status === "rejected")
          return (
            <div className="flex gap-2 items-center">
              {viewBtn}
              <span className="text-xs text-amber-300 italic">Reschedule requested</span>
            </div>
          );
        if (item.status === "accepted")
          return (
            <div className="flex gap-2 items-center">
              {viewBtn}
              <span className="text-xs text-emerald-400 italic">✓ Accepted</span>
            </div>
          );
        return <div className="flex gap-2">{viewBtn}</div>;
      },
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">Assignments</h2>
      <p className="text-slate-400 text-sm mb-4">View and respond to assigned interviews.</p>

      {error && (
        <p className="text-red-400 text-sm mb-4" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3 sm:gap-4 mb-4">
        <span className="text-sm text-slate-400">
          Pending on page: <strong className="text-amber-400">{pendingCount}</strong>
        </span>
        <span className="text-sm text-slate-400">
          Total: <strong className="text-slate-200">{total}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-3 sm:gap-4 items-end mb-6">
        <div className="min-w-0">
          <label className="block text-xs text-slate-400 font-semibold mb-1.5">Search Assignments</label>
          <SearchInput
            placeholder="Search by candidate name or job title..."
            onSearch={(v) => {
              setSearchQuery(v);
              setPage(1);
            }}
          />
        </div>
        <div className="min-w-0">
          <label className="block text-xs text-slate-400 font-semibold mb-1.5">Filter</label>
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as "asc" | "desc");
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      <div>
        {isLoading ? (
          <p className="text-slate-400 py-8 text-center">Loading assignments...</p>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <Table<InterviewerAssignmentItem>
                columns={columns}
                data={filtered}
                rowKey={(item) => item.id}
                emptyMessage={emptyMessage}
              />
            </div>

            <div className="md:hidden space-y-3">
              {filtered.length === 0 ? (
                <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-8 text-center text-sm text-slate-300">
                  {emptyMessage}
                </div>
              ) : (
                filtered.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="m-0 text-sm font-semibold text-slate-100 truncate">{item.candidateName}</h3>
                        <p className="m-0 mt-1 text-xs text-slate-500 truncate">{item.candidateEmail}</p>
                      </div>
                      <span className="inline-block py-0.5 px-2 rounded text-[11px] font-semibold bg-violet-500/20 text-violet-300">
                        {item.interviewRound}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-slate-800/70 px-2.5 py-2">
                        <p className="m-0 text-slate-400">Role</p>
                        <p className="m-0 mt-1 font-semibold text-slate-100">{item.jobTitle || "—"}</p>
                      </div>
                      <div className="rounded-lg bg-slate-800/70 px-2.5 py-2">
                        <p className="m-0 text-slate-400">Date</p>
                        <p className="m-0 mt-1 font-semibold text-slate-100">{formatDate(item.date)}</p>
                      </div>
                      <div className="rounded-lg bg-slate-800/70 px-2.5 py-2">
                        <p className="m-0 text-slate-400">Time</p>
                        <p className="m-0 mt-1 font-semibold text-blue-400">{formatTime(item.startTime)}</p>
                      </div>
                      <div className="rounded-lg bg-slate-800/70 px-2.5 py-2">
                        <p className="m-0 text-slate-400">Type</p>
                        <p className="m-0 mt-1 font-semibold text-slate-100">{getInterviewTypeLabel(item.interviewType)}</p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <Button
                        variant="secondary"
                        className="!py-2 !px-3 text-xs !bg-slate-700 w-full"
                        onClick={() => handleViewResume(item.id)}
                        disabled={resumeLoadingId === item.id}
                      >
                        {resumeLoadingId === item.id ? "Loading..." : "View Resume"}
                      </Button>
                      {item.status === "pending" || item.status === "scheduled" ? (
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="primary"
                            className="!py-2 !px-3 text-xs w-full"
                            onClick={() => handleAccept(item.id)}
                            disabled={isAccepting}
                          >
                            {isAccepting ? "Accepting..." : "Accept"}
                          </Button>
                          <Button
                            variant="amber"
                            className="!py-2 !px-3 text-xs w-full"
                            onClick={() => openRejectModal(item)}
                            disabled={isAccepting}
                          >
                            Reschedule
                          </Button>
                        </div>
                      ) : item.status === "rejected" ? (
                        <span className="text-xs text-amber-300 italic">Reschedule requested</span>
                      ) : item.status === "accepted" ? (
                        <span className="text-xs text-emerald-400 italic">✓ Accepted</span>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
            {!isLoading && filtered.length > 0 && (
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
          </>
        )}
      </div>

      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white m-0 text-lg font-semibold">Request Reschedule</h3>
              <button
                type="button"
                className="bg-transparent border-none text-slate-400 cursor-pointer p-1 rounded hover:bg-white/10 hover:text-white"
                onClick={closeRejectModal}
                disabled={isRejecting}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Please provide a reason for rescheduling the interview for{" "}
              <strong className="text-white">{rejectInterview?.candidateName}</strong>. This is sent to the HR team.
            </p>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
              Reason (required)
            </label>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="E.g., time conflict, out of office..."
              disabled={isRejecting}
              className="w-full py-2 px-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 resize-y placeholder:text-slate-500"
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" className="!bg-slate-600" onClick={closeRejectModal} disabled={isRejecting}>
                Cancel
              </Button>
              <Button
                variant="amberGradient"
                onClick={submitReject}
                disabled={!rejectionReason.trim() || isRejecting}
              >
                {isRejecting ? "Submitting..." : "Submit request"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewerAssignments;
