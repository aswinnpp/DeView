import { useMemo, useState } from "react";
import { Button, Table, Pagination, SearchInput } from "../../components/common";
import { useInterviewerCompletedInterviews } from "../../hooks/interviewer/useInterviewerCompletedInterviews";
import { interviewerCompletedInterviewsService } from "../../services/interviewerCompletedInterviews.service";
import { interviewerFeedbackSchema } from "../../../../Shared/contracts/interviewer/interviewerFeedback.schema";

type InterviewItem = {
  id: string;
  candidateName: string;
  jobDescription: { name: string };
  scheduledAt: string;
  status: string;
  feedbackSubmitted: boolean;
  latestFeedback: string | null;
  latestTotalScore: number | null;
};

const FEEDBACK_PREVIEW_LEN = 120;

function previewFeedback(text: string | null): string {
  if (!text?.trim()) return "—";
  const t = text.trim();
  return t.length <= FEEDBACK_PREVIEW_LEN ? t : `${t.slice(0, FEEDBACK_PREVIEW_LEN)}…`;
}

const overallRatingField = { key: "overall", label: "Your Overall Score (1-10)" };

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
  const [showSubmittedModal, setShowSubmittedModal] = useState(false);
  const [submittedModalMessage, setSubmittedModalMessage] = useState("Feedback submitted successfully.");
  const [formErrors, setFormErrors] = useState<{ overallScore?: string; comments?: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const needsEvaluation = useMemo(() => interviews, [interviews]);

  const ensureDraft = (draft?: { overallScore?: number; comments?: string }) => ({
    overallScore: Number(
      draft?.overallScore != null && Number.isFinite(draft.overallScore) ? draft.overallScore : 3
    ),
    comments: draft?.comments ?? "",
  });

  const openEvaluationModal = (interview: InterviewItem) => {
    setCurrentInterview(interview);
    if (!evaluationDrafts[interview.id]) {
      setEvaluationDrafts((prev) => ({
        ...prev,
        [interview.id]: ensureDraft({
          overallScore: interview.latestTotalScore ?? undefined,
          comments: interview.latestFeedback ?? "",
        }),
      }));
    }
    setFormErrors(null);
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const closeEvaluationModal = () => {
    setIsModalOpen(false);
    setCurrentInterview(null);
    setFormErrors(null);
    setSubmitError(null);
  };

  const handleDraftChange = (interviewId: string, field: "overallScore" | "comments", value: string | number) => {
    setEvaluationDrafts((prev) => {
      const draft = ensureDraft(prev[interviewId]);
      return {
        ...prev,
        [interviewId]: { ...draft, [field]: value },
      };
    });
    // Clear previous validation messages when user edits the form.
    setFormErrors(null);
    setSubmitError(null);
  };

  const submitEvaluation = async () => {
    if (!currentInterview) return;
    const interviewId = currentInterview.id;
    const draft = evaluationDrafts[interviewId];

    setFormErrors(null);
    setSubmitError(null);

    const parsed = interviewerFeedbackSchema.safeParse({
      overallScore: draft?.overallScore,
      comments: draft?.comments,
    });

    if (!parsed.success) {
      const nextErrors: { overallScore?: string; comments?: string } = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (path === "overallScore") nextErrors.overallScore = issue.message;
        if (path === "comments") nextErrors.comments = issue.message;
      }
      setFormErrors(nextErrors);
      return;
    }

    try {
      await interviewerCompletedInterviewsService.submitFeedback(interviewId, {
        totalScore: parsed.data.overallScore,
        feedback: parsed.data.comments,
      });
      closeEvaluationModal();
      setEvaluationDrafts((prev) => {
        const next = { ...prev };
        delete next[interviewId];
        return next;
      });
      await fetchItems();
      setSubmittedModalMessage("Feedback submitted successfully.");
      setShowSubmittedModal(true);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Failed to submit feedback. Please try again.");
    }
  };

  const currentDraft = currentInterview ? evaluationDrafts[currentInterview.id] ?? ensureDraft() : ensureDraft();

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
      header: "Your score",
      render: (item: InterviewItem) => (
        <span className="text-slate-300">
          {item.latestTotalScore != null ? item.latestTotalScore.toFixed(1) : "—"}
        </span>
      ),
    },
    {
      header: "Feedback",
      render: (item: InterviewItem) => (
        <span className="text-slate-400 text-sm max-w-[min(28rem,55vw)] inline-block align-top">
          {previewFeedback(item.latestFeedback)}
        </span>
      ),
    },
    {
      header: "Action",
      render: (item: InterviewItem) => {
        const hasSavedFeedback =
          item.feedbackSubmitted || (item.latestFeedback != null && item.latestFeedback.trim() !== "");
        return (
          <Button
            variant="primary"
            className="!py-2 !px-3 text-sm"
            onClick={() => openEvaluationModal(item)}
            disabled={isLoading}
          >
            {hasSavedFeedback ? "Edit" : "Add feedback"}
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">Completed interviews & feedback</h2>
      <p className="text-slate-400 text-sm mb-6">
        All completed interviews, newest first. Add or edit your score and written feedback anytime.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-3 sm:gap-4 items-end mb-4">
        <div className="min-w-0">
          <label className="block text-xs text-slate-400 font-semibold mb-1.5">Search Interviews</label>
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

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="mt-4">
        <div className="hidden md:block overflow-x-auto">
          <Table<InterviewItem>
            columns={columns}
            data={needsEvaluation}
            rowKey={(item) => item.id}
            emptyMessage={emptyMessage}
          />
        </div>

        <div className="md:hidden space-y-3">
          {needsEvaluation.length === 0 ? (
            <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-8 text-center text-sm text-slate-300">
              {emptyMessage}
            </div>
          ) : (
            needsEvaluation.map((item) => {
              const date = item.scheduledAt ? new Date(item.scheduledAt) : null;
              const hasSavedFeedback =
                item.feedbackSubmitted || (item.latestFeedback != null && item.latestFeedback.trim() !== "");
              return (
                <div key={item.id} className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="m-0 text-sm font-semibold text-slate-100 truncate">{item.candidateName}</h3>
                      <p className="m-0 mt-1 text-xs text-slate-400 truncate">{item.jobDescription?.name ?? "—"}</p>
                    </div>
                    <span className="text-xs text-slate-300">{item.status}</span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-slate-800/70 px-2.5 py-2">
                      <p className="m-0 text-slate-400">Date</p>
                      <p className="m-0 mt-1 font-semibold text-slate-100">{date ? date.toLocaleDateString() : "—"}</p>
                    </div>
                    <div className="rounded-lg bg-slate-800/70 px-2.5 py-2">
                      <p className="m-0 text-slate-400">Time</p>
                      <p className="m-0 mt-1 font-semibold text-slate-100">
                        {date ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-800/70 px-2.5 py-2 col-span-2">
                      <p className="m-0 text-slate-400">Your score</p>
                      <p className="m-0 mt-1 font-semibold text-slate-100">
                        {item.latestTotalScore != null ? item.latestTotalScore.toFixed(1) : "—"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-800/70 px-2.5 py-2 col-span-2">
                      <p className="m-0 text-slate-400">Feedback</p>
                      <p className="m-0 mt-1 text-slate-300">{previewFeedback(item.latestFeedback)}</p>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    className="!mt-3 !py-2 !px-3 text-xs w-full"
                    onClick={() => openEvaluationModal(item)}
                    disabled={isLoading}
                  >
                    {hasSavedFeedback ? "Edit" : "Add feedback"}
                  </Button>
                </div>
              );
            })
          )}
        </div>
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
                  max={10}
                  step={0.1}
                  className="w-full py-2 px-3 mt-1 border border-blue-400 rounded bg-white/90 text-slate-900"
                  value={currentDraft.overallScore}
                  onChange={(e) =>
                    handleDraftChange(currentInterview.id, "overallScore", e.target.value)
                  }
                />
                {formErrors?.overallScore ? (
                  <p className="m-0 mt-1 text-xs text-red-300">{formErrors.overallScore}</p>
                ) : null}
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
                {formErrors?.comments ? (
                  <p className="m-0 mt-1 text-xs text-red-300">{formErrors.comments}</p>
                ) : null}
              </label>
            </div>

            <div className="flex justify-end gap-2.5 mt-6">
              <Button variant="secondary" className="!bg-slate-700" onClick={closeEvaluationModal}>
                Cancel / Close
              </Button>
              <Button
                variant="primary"
                onClick={submitEvaluation}
                // Let the submit handler run so Zod errors can be displayed inline.
                disabled={isLoading}
              >
                {isLoading
                  ? "Submitting..."
                  : currentInterview?.feedbackSubmitted
                    ? "Save changes"
                    : "Finalize evaluation"}
              </Button>
            </div>

            {submitError ? <p className="m-0 mt-4 text-sm text-red-300">{submitError}</p> : null}
          </div>
        </div>
      )}

      {/* Feedback submitted confirm modal */}
      {showSubmittedModal && (
        <div className="fixed inset-0 z-[1100] bg-black/75 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-slate-50 text-lg font-bold m-0">Success</h3>
              <button
                onClick={() => setShowSubmittedModal(false)}
                className="bg-transparent border-none text-slate-400 text-2xl leading-none cursor-pointer"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-slate-300 text-sm m-0">{submittedModalMessage}</p>
              <div className="mt-5 flex justify-end">
                <Button
                  type="button"
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-none px-5 py-2.5 rounded-lg text-sm font-semibold"
                  onClick={() => setShowSubmittedModal(false)}
                >
                  OK
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewerManageInterviews;
