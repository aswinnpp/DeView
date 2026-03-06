import { useMemo, useState, useCallback } from "react";
import { Button, Input, Table } from "../../components/common";

type InterviewItem = {
  id: string;
  candidateName: string;
  jobDescription: { name: string };
  scheduledAt: string;
  status: string;
  aiScore?: number;
};

const sampleNeedsEvaluationInterviews: InterviewItem[] = [
  {
    id: "eval-201",
    candidateName: "Victor Chen",
    jobDescription: { name: "Full Stack Developer" },
    scheduledAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: "completed",
    aiScore: 4.1,
  },
  {
    id: "eval-202",
    candidateName: "Maria G.",
    jobDescription: { name: "Marketing Specialist" },
    scheduledAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
    status: "completed",
    aiScore: 2.8,
  },
  {
    id: "eval-203",
    candidateName: "Kwame A.",
    jobDescription: { name: "Senior Architect" },
    scheduledAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: "completed",
    aiScore: 3.5,
  },
];

const overallRatingField = { key: "overall", label: "Your Overall Score (1-5)" };

const inputBaseClass =
  "w-full py-2 px-3.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500";
const selectClass = `${inputBaseClass} cursor-pointer`;

const InterviewerManageInterviews = () => {
  const [interviews, setInterviews] = useState<InterviewItem[]>(sampleNeedsEvaluationInterviews);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluationDrafts, setEvaluationDrafts] = useState<Record<string, { overallScore: number; decision: string; comments: string }>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInterview, setCurrentInterview] = useState<InterviewItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "role">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const needsEvaluation = useMemo(() => {
    let result = [...interviews];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (interview) =>
          interview.candidateName?.toLowerCase().includes(query) ||
          interview.jobDescription?.name?.toLowerCase().includes(query)
      );
    }
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "date") {
        const dateA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
        const dateB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
        comparison = dateA - dateB;
      } else if (sortBy === "name") {
        comparison = (a.candidateName || "").localeCompare(b.candidateName || "");
      } else if (sortBy === "role") {
        comparison = (a.jobDescription?.name || "").localeCompare(b.jobDescription?.name || "");
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
    return result;
  }, [interviews, searchQuery, sortBy, sortOrder]);

  const ensureDraft = (draft?: { overallScore?: number; decision?: string; comments?: string }) => ({
    overallScore: Number(draft?.overallScore ?? 3),
    decision: draft?.decision ?? "",
    comments: draft?.comments ?? "",
  });

  const openEvaluationModal = (interview: InterviewItem) => {
    setCurrentInterview(interview);
    if (!evaluationDrafts[interview.id]) {
      setEvaluationDrafts((prev) => ({ ...prev, [interview.id]: ensureDraft() }));
    }
    setIsModalOpen(true);
  };

  const closeEvaluationModal = () => {
    setIsModalOpen(false);
    setCurrentInterview(null);
  };

  const handleDraftChange = (interviewId: string, field: "overallScore" | "decision" | "comments", value: string | number) => {
    setEvaluationDrafts((prev) => {
      const draft = ensureDraft(prev[interviewId]);
      return {
        ...prev,
        [interviewId]: { ...draft, [field]: value },
      };
    });
  };

  const submitEvaluation = async () => {
    if (!currentInterview) return;
    const interviewId = currentInterview.id;
    const draft = evaluationDrafts[interviewId];

    if (!draft?.decision || !draft?.comments) {
      alert("Please select a hiring decision and add detailed comments.");
      return;
    }
    if (draft.overallScore < 1 || draft.overallScore > 5) {
      alert("Please ensure the overall score is between 1 and 5.");
      return;
    }

    setIsLoading(true);
    closeEvaluationModal();
    setTimeout(() => {
      setInterviews((prev) => prev.filter((item) => item.id !== interviewId));
      setEvaluationDrafts((prev) => {
        const next = { ...prev };
        delete next[interviewId];
        return next;
      });
      setIsLoading(false);
      refetch();
    }, 500);
  };

  const currentDraft = currentInterview ? evaluationDrafts[currentInterview.id] ?? ensureDraft() : ensureDraft();
  const isFormValid = Boolean(currentDraft?.decision && currentDraft?.comments);

  const emptyMessage =
    interviews.length === 0
      ? "✅ All evaluations are submitted."
      : "🔍 No interviews found matching your search.";

  const columns = [
    {
      header: "Candidate",
      render: (item: InterviewItem) => <span className="font-medium text-slate-200">{item.candidateName}</span>,
    },
    {
      header: "Role / JD",
      render: (item: InterviewItem) => <span className="text-slate-300">{item.jobDescription?.name ?? "—"}</span>,
    },
    {
      header: "Interview Date",
      render: (item: InterviewItem) => {
        const date = item.scheduledAt ? new Date(item.scheduledAt) : null;
        return <span className="text-slate-300">{date ? date.toLocaleDateString() : "—"}</span>;
      },
    },
    {
      header: "Time",
      render: (item: InterviewItem) => {
        const date = item.scheduledAt ? new Date(item.scheduledAt) : null;
        return (
          <span className="text-slate-300">
            {date ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
          </span>
        );
      },
    },
    {
      header: "Status",
      render: (item: InterviewItem) => <span className="text-slate-300">{item.status}</span>,
    },
    {
      header: "Action",
      render: (item: InterviewItem) => {
        const draft = evaluationDrafts[item.id] ?? ensureDraft();
        return (
          <Button
            variant="primary"
            className="!py-2 !px-3 text-sm"
            onClick={() => openEvaluationModal(item)}
            disabled={isLoading}
          >
            {draft.comments ? "Edit Evaluation" : "Add Marks / Feedback"}
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">Managed (Pending Feedback)</h2>
      <p className="text-slate-400 text-sm mb-6">
        Recently completed interviews that still need your structured evaluation.
      </p>

      <div className="flex flex-wrap gap-4 items-end mb-4">
        <div className="flex-1 min-w-[250px]">
          <Input
            label="Search Interviews"
            placeholder="Search by candidate name or job title..."
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
            <option value="date">Interview Date</option>
            <option value="name">Candidate Name</option>
            <option value="role">Role / JD</option>
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
        {(searchQuery || sortBy !== "date" || sortOrder !== "desc") && (
          <Button
            variant="secondary"
            className="!bg-slate-600 !py-2.5 !px-4 text-sm font-medium"
            onClick={() => {
              setSearchQuery("");
              setSortBy("date");
              setSortOrder("desc");
            }}
          >
            Reset
          </Button>
        )}
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="mt-4 overflow-x-auto">
        <Table<InterviewItem>
          columns={columns}
          data={needsEvaluation}
          rowKey={(item) => item.id}
          emptyMessage={emptyMessage}
        />
      </div>

      {isModalOpen && currentInterview && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 md:p-8 rounded-lg max-w-[600px] w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="m-0 text-xl font-semibold text-white">{currentInterview.candidateName}</h3>
              <button
                type="button"
                className="bg-transparent border-none text-slate-800 text-2xl cursor-pointer p-1 rounded hover:bg-white/20"
                onClick={closeEvaluationModal}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <label className="block text-sm font-semibold text-white">
                {overallRatingField.label}
                <input
                  type="number"
                  min={1}
                  max={5}
                  step={0.1}
                  className="w-full py-2 px-3 mt-1 border border-blue-400 rounded bg-white/90 text-slate-900"
                  value={currentDraft.overallScore}
                  onChange={(e) =>
                    handleDraftChange(currentInterview.id, "overallScore", e.target.value)
                  }
                />
              </label>

              <label className="block text-sm font-semibold text-white">
                Hiring Decision
                <select
                  className="w-full py-2 px-3 mt-1 rounded border border-slate-300 bg-white/90 text-slate-900 cursor-pointer"
                  value={currentDraft.decision}
                  onChange={(e) => handleDraftChange(currentInterview.id, "decision", e.target.value)}
                >
                  <option value="">-- Select Decision --</option>
                  <option value="hire">Hire</option>
                  <option value="hold">Hold (Further review)</option>
                  <option value="no-hire">No-hire</option>
                </select>
              </label>

              <label className="block text-sm font-semibold text-white">
                Detailed Comments / Justification
                <textarea
                  rows={6}
                  placeholder="Provide detailed justification for your score and decision. Mention strengths, weaknesses, and key discussion points."
                  className="w-full py-2 px-3 mt-1 border border-slate-300 rounded bg-white/90 text-slate-900 resize-y"
                  value={currentDraft.comments}
                  onChange={(e) =>
                    handleDraftChange(currentInterview.id, "comments", e.target.value)
                  }
                />
              </label>
            </div>

            <div className="flex justify-end gap-2.5 mt-6">
              <Button variant="secondary" className="!bg-slate-700" onClick={closeEvaluationModal}>
                Cancel / Close
              </Button>
              <Button
                variant="primary"
                onClick={submitEvaluation}
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? "Submitting..." : "Finalize Evaluation"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewerManageInterviews;
