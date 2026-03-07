import { Button, Input, Table } from "../../components/common";
import { useInterviewerAssignments } from "../../hooks/interviewer";
import type { InterviewerAssignmentItem } from "../../services/interviewerAssignments.service";

const inputBaseClass =
  "w-full py-2 px-3.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500";
const selectClass = `${inputBaseClass} cursor-pointer`;

const statusStyles: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-amber-500/20", text: "text-amber-400" },
  accepted: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  rejected: { bg: "bg-red-500/20", text: "text-red-400" },
  scheduled: { bg: "bg-blue-500/20", text: "text-blue-400" },
  completed: { bg: "bg-green-500/20", text: "text-green-400" },
  cancelled: { bg: "bg-slate-500/20", text: "text-slate-400" },
};

const InterviewerAssignments = () => {
  const {
    filtered,
    pendingCount,
    assignments,
    emptyMessage,
    isLoading,
    error,
    isAccepting,
    isRejecting,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    hasActiveFilters,
    resetFilters,
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
  } = useInterviewerAssignments();

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
          {formatTime(item.startTime)} – {formatTime(item.endTime)}
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
      header: "Status",
      render: (item: InterviewerAssignmentItem) => {
        const s = statusStyles[item.status] || statusStyles.pending;
        const label = item.status.charAt(0).toUpperCase() + item.status.slice(1);
        return (
          <span className={`inline-block py-1 px-2.5 rounded text-xs font-semibold ${s.bg} ${s.text}`}>
            {label}
          </span>
        );
      },
    },
    {
      header: "Actions",
      render: (item: InterviewerAssignmentItem) => {
        if (item.status === "pending" || item.status === "scheduled")
          return (
            <div className="flex gap-2">
              <Button
                variant="primary"
                className="!py-1.5 !px-3 text-xs"
                onClick={() => handleAccept(item.id)}
                disabled={isAccepting}
              >
                {isAccepting ? "Accepting..." : "Accept"}
              </Button>
              <Button
                variant="danger"
                className="!py-1.5 !px-3 text-xs"
                onClick={() => openRejectModal(item)}
                disabled={isAccepting}
              >
                Reject
              </Button>
            </div>
          );
        if (item.status === "rejected")
          return <span className="text-xs text-red-400 italic">Rejected</span>;
        if (item.status === "accepted")
          return <span className="text-xs text-emerald-400 italic">✓ Accepted</span>;
        return <span className="text-xs text-slate-500">—</span>;
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

      <div className="flex gap-4 mb-4">
        <span className="text-sm text-slate-400">
          Pending: <strong className="text-amber-400">{pendingCount}</strong>
        </span>
        <span className="text-sm text-slate-400">
          Total: <strong className="text-slate-200">{assignments.length}</strong>
        </span>
      </div>

      <div className="flex flex-wrap gap-4 items-end mb-6">
        <div className="flex-1 min-w-[250px]">
          <Input
            label="Search Assignments"
            placeholder="Search by candidate name, email, or job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            wrapperClassName="flex flex-col gap-1.5"
            labelClassName="block text-xs text-slate-400 font-semibold"
            className={inputBaseClass}
          />
        </div>
        <div className="min-w-[150px]">
          <label className="block text-xs text-slate-400 font-semibold mb-1.5">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "name" | "status")}
            className={selectClass}
          >
            <option value="date">Date</option>
            <option value="name">Candidate Name</option>
            <option value="status">Status</option>
          </select>
        </div>
        <div className="min-w-[130px]">
          <label className="block text-xs text-slate-400 font-semibold mb-1.5">Order</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            className={selectClass}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
        {hasActiveFilters && (
          <Button
            variant="secondary"
            className="!bg-slate-600 !py-2.5 !px-4 text-sm"
            onClick={resetFilters}
          >
            Reset
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <p className="text-slate-400 py-8 text-center">Loading assignments...</p>
        ) : (
          <Table<InterviewerAssignmentItem>
            columns={columns}
            data={filtered}
            rowKey={(item) => item.id}
            emptyMessage={emptyMessage}
          />
        )}
      </div>

      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white m-0 text-lg font-semibold">Reject Assignment</h3>
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
              Please provide a reason for rejecting the interview for{" "}
              <strong className="text-white">{rejectInterview?.candidateName}</strong>. This is sent to the HR team.
            </p>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
              Rejection Reason (required)
            </label>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="E.g., time conflict, outside my domain..."
              disabled={isRejecting}
              className="w-full py-2 px-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 resize-y placeholder:text-slate-500"
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" className="!bg-slate-600" onClick={closeRejectModal} disabled={isRejecting}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={submitReject}
                disabled={!rejectionReason.trim() || isRejecting}
              >
                {isRejecting ? "Submitting..." : "Confirm Reject"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewerAssignments;
