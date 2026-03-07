import { Button, Input, Table } from "../../components/common";
import { useInterviewerDashboard } from "../../hooks/interviewer";
import type { InterviewerAssignmentItem } from "../../services/interviewerAssignments.service";

const inputBaseClass =
  "w-full py-2 px-3.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500";
const selectClass = `${inputBaseClass} cursor-pointer`;

const InterviewerDashboard = () => {
  const {
    assignments,
    acceptedOnly,
    filtered,
    emptyMessage,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    hasActiveFilters,
    resetFilters,
    formatTime,
    formatDate,
    handleJoinRoom,
  } = useInterviewerDashboard();

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
      header: "Status",
      render: () => (
        <span className="inline-block py-1 px-2.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400">
          Accepted
        </span>
      ),
    },
    {
      header: "Action",
      render: (item: InterviewerAssignmentItem) => (
        <Button
          variant="primary"
          className="!py-2 !px-4 text-sm"
          onClick={() => handleJoinRoom(item.id)}
        >
          Join Room
        </Button>
      ),
    },
  ];

  return (
    <div className="py-6 px-0">
      <h2 className="text-lg font-semibold text-white mb-1">Upcoming Accepted Interviews</h2>
      <p className="text-slate-400 text-sm mb-4">
        Interviews you have accepted. Use Join Room to start the online session.
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
          Total assigned: <strong className="text-slate-200">{assignments.length}</strong>
        </span>
      </div>

      <div className="flex flex-wrap gap-4 items-end mb-6">
        <div className="flex-1 min-w-[250px]">
          <Input
            label="Search Interviews"
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
            onChange={(e) => setSortBy(e.target.value as "date" | "name" | "role")}
            className={selectClass}
          >
            <option value="date">Date</option>
            <option value="name">Candidate Name</option>
            <option value="role">Role / Position</option>
          </select>
        </div>
        <div className="min-w-[130px]">
          <label className="block text-xs text-slate-400 font-semibold mb-1.5">Order</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            className={selectClass}
          >
            <option value="asc">Earliest First</option>
            <option value="desc">Latest First</option>
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
          <p className="text-slate-400 py-8 text-center">Loading interviews...</p>
        ) : (
          <Table<InterviewerAssignmentItem>
            columns={columns}
            data={filtered}
            rowKey={(item) => item.id}
            emptyMessage={emptyMessage}
          />
        )}
      </div>
    </div>
  );
};

export default InterviewerDashboard;
