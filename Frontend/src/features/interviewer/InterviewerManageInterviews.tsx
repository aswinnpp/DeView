import { useMemo, useState } from "react";
import { Button, Table, Pagination, SearchInput } from "../../components/common";
import { useInterviewerCompletedInterviews } from "../../hooks/interviewer/useInterviewerCompletedInterviews";
import { interviewerCompletedInterviewsService } from "../../services/interviewerCompletedInterviews.service";

type InterviewItem = {
  id: string;
  candidateName: string;
  jobDescription: { name: string };
  scheduledAt: string;
  status: string;
};

const overallRatingField = { key: "overall", label: "Your Overall Score (1-5)" };

const selectClass =
  "w-full py-2 px-3.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer";

const InterviewerManageInterviews = () => {
  const {
    list: interviews,
    total,
    totalPages,
    page,
    setPage,
    isLoading,
    error,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    emptyMessage,
    fetchItems,
    ITEMS_PER_PAGE,
  } = useInterviewerCompletedInterviews();

  const [evaluationDrafts, setEvaluationDrafts] = useState<Record<string, { overallScore: number; comments: string }>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInterview, setCurrentInterview] = useState<InterviewItem | null>(null);
  const [submittedFeedbackIds, setSubmittedFeedbackIds] = useState<Set<string>>(new Set());

  const needsEvaluation = useMemo(() => interviews, [interviews]);

  const ensureDraft = (draft?: { overallScore?: number; comments?: string }) => ({
    overallScore: Number(draft?.overallScore ?? 3),
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

  const handleDraftChange = (interviewId: string, field: "overallScore" | "comments", value: string | number) => {
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

    if (!draft?.comments) {
      alert("Please add detailed comments.");
      return;
    }
    if (draft.overallScore < 1 || draft.overallScore > 5) {
      alert("Please ensure the overall score is between 1 and 5.");
      return;
    }

    try {
      await interviewerCompletedInterviewsService.submitFeedback(interviewId, {
        totalScore: draft.overallScore,
        feedback: draft.comments,
      });
      setSubmittedFeedbackIds((prev) => new Set(prev).add(interviewId));
      closeEvaluationModal();
      setEvaluationDrafts((prev) => {
        const next = { ...prev };
        delete next[interviewId];
        return next;
      });
      await fetchItems();
      alert("Feedback submitted successfully.");
    } catch (e) {
      alert(
        e instanceof Error ? e.message : "Failed to submit feedback. Please try again."
      );
    }
  };

  const currentDraft = currentInterview ? evaluationDrafts[currentInterview.id] ?? ensureDraft() : ensureDraft();
  const isFormValid = Boolean(currentDraft?.comments);

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
        if (submittedFeedbackIds.has(item.id)) {
          return <span className="text-slate-400 text-sm">Submitted</span>;
        }
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
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="mt-4 overflow-x-auto">
        <Table<InterviewItem>
          columns={columns}
          data={needsEvaluation}
          rowKey={(item) => item.id}
          emptyMessage={emptyMessage}
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
