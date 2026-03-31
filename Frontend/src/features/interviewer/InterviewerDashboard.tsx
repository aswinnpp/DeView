import { useState } from "react";
import { Button, Table, Pagination, SearchInput } from "../../components/common";
import { useInterviewerDashboard } from "../../hooks/interviewer";
import type { InterviewerAssignmentItem } from "../../services/interviewerAssignments.service";
import { interviewerAssignmentsService } from "../../services/interviewerAssignments.service";
import { interviewsService } from "../../services/interviews.service";

const selectClass =
  "w-full py-2 px-3.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer";

const InterviewerDashboard = () => {
  const {
    
    acceptedOnly,
    filtered,
    total,
    totalPages,
    page,
    setPage,
    emptyMessage,
    isLoading,
    error,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    formatTime,
    formatDate,
    handleJoinRoom,
    fetchAssignments,
    ITEMS_PER_PAGE,
  } = useInterviewerDashboard();
  const [updatingInterviewId, setUpdatingInterviewId] = useState<string | null>(null);

  // Reschedule modal state
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleInterview, setRescheduleInterview] = useState<InterviewerAssignmentItem | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);

  const getInterviewTypeLabel = (type?: string) => {
    if (type === "CALL") return "Call";
    if (type === "F2F") return "Face to Face";
    return "Online";
  };

  const handleUpdateStatus = async (interviewId: string, status: "COMPLETED" | "CANCELLED") => {
    setUpdatingInterviewId(interviewId);
    try {
      await interviewsService.updateStatus(interviewId, status);
      await fetchAssignments();
    } finally {
      setUpdatingInterviewId(null);
    }
  };

  const openRescheduleModal = (item: InterviewerAssignmentItem) => {
    setRescheduleInterview(item);
    setRescheduleReason("");
    setRescheduleModalOpen(true);
  };

  const closeRescheduleModal = () => {
    setRescheduleModalOpen(false);
    setRescheduleInterview(null);
    setRescheduleReason("");
  };

  const submitReschedule = async () => {
    if (!rescheduleInterview) return;
    if (!rescheduleReason.trim()) return;
    setIsRescheduling(true);
    try {
      await interviewerAssignmentsService.reject(rescheduleInterview.id, rescheduleReason.trim());
      await fetchAssignments();
      closeRescheduleModal();
    } catch {
      window.alert("Could not request reschedule. Please try again.");
    } finally {
      setIsRescheduling(false);
    }
  };

  const columns = [
    {
      header: "Candidate",
      render: (item: InterviewerAssignmentItem) => (
        <div>
          <div className="font-semibold text-slate-200">{item.candidateName}</div>
          {item.candidateEmail && (
            <div className="text-xs text-slate-500">{item.candidateEmail}</div>
          )}
        </div>
      ),
    },
    {
      header: "Role / Position",
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
          {item.endTime && item.endTime !== item.startTime
            ? ` – ${formatTime(item.endTime)}`
            : ""}
        </span>
      ),
    },
    {
      header: "Round",
      render: (item: InterviewerAssignmentItem) => (
        <span className="inline-block py-0.5 px-2 rounded text-[11px] font-semibold bg-violet-500/20 text-violet-300">
          {item.interviewRound || "—"}
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
      header: "Status",
      render: () => (
        <span className="inline-block py-1 px-2.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400">
          Accepted
        </span>
      ),
    },
    {
      header: "Action",
      render: (item: InterviewerAssignmentItem) =>
        <div className="flex gap-2 items-center">
          {(item.interviewType ?? "ONLINE") === "ONLINE" ? (
            <Button
              variant="primary"
              className="!py-2 !px-4 text-sm"
              onClick={() => handleJoinRoom(item.id)}
            >
              Join Room
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="primary"
                className="!py-2 !px-3 text-xs"
                onClick={() => handleUpdateStatus(item.id, "COMPLETED")}
                disabled={updatingInterviewId === item.id}
              >
                Complete
              </Button>
              <Button
                variant="danger"
                className="!py-2 !px-3 text-xs"
                onClick={() => handleUpdateStatus(item.id, "CANCELLED")}
                disabled={updatingInterviewId === item.id}
              >
                Not Attempt
              </Button>
            </div>
          )}

          <Button
            variant="amber"
            className="!py-2 !px-3 text-xs"
            onClick={() => openRescheduleModal(item)}
            disabled={isRescheduling && rescheduleInterview?.id === item.id}
          >
            Request Reschedule
          </Button>
        </div>,
    },
  ];

  return (
    <div className="py-6 px-0">
      <h2 className="text-lg font-semibold text-white mb-1">Upcoming Accepted Interviews</h2>
      <p className="text-slate-400 text-sm mb-4">
        Interviews you have accepted. Online interviews can be joined; call and face-to-face can be marked directly.
      </p>

      {error && (
        <p className="text-red-400 text-sm mb-4" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-4 mb-4">
        <span className="text-sm text-slate-400">
          Accepted: <strong className="text-emerald-400">{acceptedOnly.length}</strong>
        </span>
        <span className="text-sm text-slate-400">
          Total: <strong className="text-slate-200">{total}</strong>
        </span>
      </div>

      <div className="flex flex-wrap gap-4 items-end mb-6">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-xs text-slate-400 font-semibold mb-1.5">Search Interviews</label>
          <SearchInput
            placeholder="Search by candidate name or job title..."
            onSearch={(v) => {
              setSearchQuery(v);
              setPage(1);
            }}
          />
        </div>
        <div className="min-w-[160px]">
          <label className="block text-xs text-slate-400 font-semibold mb-1.5">Filter</label>
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as "asc" | "desc");
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="asc">Earliest First</option>
            <option value="desc">Latest First</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <p className="text-slate-400 py-8 text-center">Loading interviews...</p>
        ) : (
          <>
            <Table<InterviewerAssignmentItem>
              columns={columns}
              data={filtered}
              rowKey={(item) => item.id}
              emptyMessage={emptyMessage}
            />
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

      {rescheduleModalOpen && rescheduleInterview && (
        <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white m-0 text-lg font-semibold">Request Reschedule</h3>
              <button
                type="button"
                className="bg-transparent border-none text-slate-400 cursor-pointer p-1 rounded hover:bg-white/10 hover:text-white"
                onClick={closeRescheduleModal}
                disabled={isRescheduling}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-400 text-sm mb-4">
              Please provide a reason for requesting a reschedule for{" "}
              <strong className="text-white">{rescheduleInterview.candidateName}</strong>. This is sent to the HR team.
            </p>

            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Reason (required)</label>
            <textarea
              rows={4}
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              placeholder="E.g., time conflict, outside my domain..."
              disabled={isRescheduling}
              className="w-full py-2 px-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 resize-y placeholder:text-slate-500"
            />

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="secondary"
                className="!bg-slate-600"
                onClick={closeRescheduleModal}
                disabled={isRescheduling}
              >
                Cancel
              </Button>
              <Button
                variant="amberGradient"
                onClick={submitReschedule}
                disabled={!rescheduleReason.trim() || isRescheduling}
              >
                {isRescheduling ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewerDashboard;
