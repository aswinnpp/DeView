import { useState } from "react";
import { Button, ConfirmModal, Pagination, SearchInput, Table } from "../../components/common";
import { useOfferLetters } from "../../hooks/offerLetter/useOfferLetters";

export type OfferLetterRow = {
  id: string | null;
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  jobId: string;
  content: string;
  salary?: string;
  location?: string;
  startDate?: string;
  benefits?: string;
  positionTitle?: string;
  status: "pending" | "accepted" | "declined" | "counter";
  counterLetter?: string;
  counterSentAt?: string;
  counterResponseStatus?: "accepted" | "rejected";
  /** DocuSign combined PDF available after digital acceptance. */
  signedOfferAvailable?: boolean;
  createdAt: string;
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatEmailDate(dateStr: string) {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function splitBenefits(benefits: string | undefined) {
  if (!benefits?.trim()) return [];
  return benefits
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function offerPaperTitle(status: OfferLetterRow["status"]) {
  return status === "declined" ? "Rejection" : "Offer Letter";
}

function offerPaperStatusLabel(status: OfferLetterRow["status"]) {
  switch (status) {
    case "accepted":
      return "Accepted";
    case "declined":
      return "Declined";
    case "counter":
      return "Counter received";
    default:
      return "Awaiting your response";
  }
}

function StatusBadge({ status }: { status: OfferLetterRow["status"] }) {
  const config: Record<
    string,
    { label: string; className: string }
  > = {
    pending: {
      label: "Pending",
      className: "bg-amber-500/20 text-amber-200",
    },
    accepted: {
      label: "Accepted",
      className: "bg-emerald-500/20 text-emerald-300",
    },
    declined: {
      label: "Declined",
      className: "bg-red-500/20 text-red-300",
    },
    counter: {
      label: "Counter Received",
      className: "bg-sky-500/20 text-sky-200",
    },
  };
  const c = config[status] ?? { label: status, className: "bg-slate-500/20 text-slate-300" };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${c.className}`}
    >
      {c.label}
    </span>
  );
}

export default function OfferLettersPage() {
  const {
    rows,
    jobs,
    page,
    setPage,
    setJobSearch,
    loading,
    error,
    selectedOffer,
    setSelectedOffer,
    selectedJobId,
    setSelectedJobId,
    selectedStatus,
    setSelectedStatus,
    counterResponding,
    signedPdfBusy,
    signedPdfError,
    openEmployerSignedPdfInNewTab,
    respondToCounter,
    jobTitleMap,
    totalPages,
    paginationLeftContent,
  } = useOfferLetters();

  const visibleRows = rows;

  const [rejectCounterConfirmOpen, setRejectCounterConfirmOpen] = useState(false);
 

  // Detail view
  if (selectedOffer) {
    const paperTitle = offerPaperTitle(selectedOffer.status);
    const paperStatus = offerPaperStatusLabel(selectedOffer.status);
    const positionTitle =
      selectedOffer.positionTitle ?? jobTitleMap.get(selectedOffer.jobId) ?? selectedOffer.jobId;
    const benefitsList = splitBenefits(selectedOffer.benefits);
    const letterContentForRender =
      selectedOffer.status === "counter" && selectedOffer.counterLetter?.trim()
        ? selectedOffer.counterLetter
        : selectedOffer.counterResponseStatus === "accepted" && selectedOffer.counterLetter?.trim()
          ? selectedOffer.counterLetter
          : selectedOffer.content;

    return (
      <div className="w-full">
        <header className="flex items-start justify-between gap-4 mb-6">
          <div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSelectedOffer(null)}
              className="!bg-transparent !border-0 !px-0 !py-0 text-slate-400 hover:text-slate-200 text-sm font-medium mb-2 inline-flex items-center gap-1.5"
            >
              ← Back to list
            </Button>
            <h1 className="text-2xl font-bold text-slate-50 m-0">Offer Letter Details</h1>
            <p className="text-slate-400 text-sm mt-2 mb-0">
              View offer details and candidate response
            </p>
          </div>
        </header>

          <div className="px-14 py-14">
            <div className="mb-6">
              <h3 className="m-0 w-full text-center text-[18px] font-bold text-slate-100">{paperTitle}</h3>
              <p className="m-0 mt-1 text-center text-[13px] font-semibold text-slate-200">{paperStatus}</p>
            </div>

            <div className="mb-8 flex items-start justify-between gap-6">
              <div>
                <p className="m-0 text-[15px] font-semibold text-slate-100">{selectedOffer.candidateName}</p>
                <p className="m-0 mt-1 text-[13px] text-slate-300">{selectedOffer.candidateEmail}</p>
              </div>
              <p className="m-0 text-[13px] text-slate-300">
                {formatEmailDate(selectedOffer.createdAt)} at {formatTime(selectedOffer.createdAt)}
              </p>
            </div>

            {signedPdfError ? (
              <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {signedPdfError}
              </div>
            ) : null}

            <dl className="mb-8 grid grid-cols-1 gap-x-10 gap-y-2 text-[13.5px] text-slate-200 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="m-0 text-[12px] font-semibold uppercase tracking-wide text-slate-300">
                  Offer details
                </dt>
              </div>

              <div>
                <dt className="m-0 text-[12px] font-semibold uppercase tracking-wide text-slate-300">Position</dt>
                <dd className="m-0 mt-1 font-semibold">{positionTitle}</dd>
              </div>

              {selectedOffer.salary ? (
                <div>
                  <dt className="m-0 text-[12px] font-semibold uppercase tracking-wide text-slate-300">Salary</dt>
                  <dd className="m-0 mt-1">{selectedOffer.salary}</dd>
                </div>
              ) : null}

              {selectedOffer.location ? (
                <div>
                  <dt className="m-0 text-[12px] font-semibold uppercase tracking-wide text-slate-300">
                    Work Location
                  </dt>
                  <dd className="m-0 mt-1">{selectedOffer.location}</dd>
                </div>
              ) : null}

              {selectedOffer.startDate ? (
                <div>
                  <dt className="m-0 text-[12px] font-semibold uppercase tracking-wide text-slate-300">Start Date</dt>
                  <dd className="m-0 mt-1">{formatEmailDate(selectedOffer.startDate)}</dd>
                </div>
              ) : null}

              {benefitsList.length > 0 ? (
                <div className="sm:col-span-2">
                  <dt className="m-0 text-[12px] font-semibold uppercase tracking-wide text-slate-300">
                    Benefits
                  </dt>
                  <dd className="m-0 mt-1">{benefitsList.join(", ")}</dd>
                </div>
              ) : null}
            </dl>

            <pre className="whitespace-pre-wrap text-slate-200 text-[15px] font-serif m-0 leading-relaxed">
              {letterContentForRender}
            </pre>

            {selectedOffer.status === "counter" && selectedOffer.counterLetter?.trim() && (
              <div className="mt-10 space-y-6 border-t border-sky-200/20 pt-8">
                <div>
                  <p className="m-0 text-[13px] font-semibold uppercase tracking-wide text-slate-300">
                    Counter received
                  </p>
                  {selectedOffer.counterSentAt ? (
                    <p className="m-0 mt-1 text-[13px] text-slate-300">
                      Submitted on {formatEmailDate(selectedOffer.counterSentAt)} at{" "}
                      {formatTime(selectedOffer.counterSentAt)}
                    </p>
                  ) : null}
                </div>

                <pre className="whitespace-pre-wrap text-slate-200 text-[15px] font-serif m-0 leading-relaxed max-h-48 overflow-y-auto">
                  {selectedOffer.counterLetter}
                </pre>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <Button
                    type="button"
                    variant="ghostOutline"
                    disabled={!!counterResponding}
                    onClick={() => void respondToCounter("accept")}
                    className="flex-1 min-w-[140px] rounded-xl border border-emerald-500/35 bg-emerald-600/15 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {counterResponding === "accept" ? "Processing…" : "Accept Counter"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghostOutline"
                    disabled={!!counterResponding}
                    onClick={() => setRejectCounterConfirmOpen(true)}
                    className="flex-1 min-w-[140px] rounded-xl border border-red-500/35 bg-red-600/15 px-5 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {counterResponding === "reject" ? "Processing…" : "Reject Counter"}
                  </Button>
                </div>
              </div>
            )}

            {selectedOffer.status === "accepted" &&
            selectedOffer.signedOfferAvailable &&
            selectedOffer.id ? (
              <div className="mt-10">
                <Button
                  type="button"
                  onClick={() => void openEmployerSignedPdfInNewTab()}
                  disabled={signedPdfBusy}
                  className="rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {signedPdfBusy ? "Opening…" : "View signed PDF"}
                </Button>
              </div>
            ) : null}

            <ConfirmModal
              isOpen={rejectCounterConfirmOpen}
              title="Reject counter proposal?"
              description="The candidate will be notified."
              confirmText={counterResponding === "reject" ? "Rejecting..." : "Reject Counter"}
              cancelText="Cancel"
              confirmVariant="danger"
              isLoading={counterResponding === "reject"}
              onClose={() => setRejectCounterConfirmOpen(false)}
              onConfirm={async () => {
                await respondToCounter("reject");
                setRejectCounterConfirmOpen(false);
              }}
            />
          </div>
        
      </div>
    );
  }

  // List view
  return (
    <div className="w-full">
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 m-0">Offer Letters</h1>
          <p className="text-slate-400 text-sm mt-2 mb-0">
            Track all sent offer letters and candidate responses. Data from Applications workflow.
          </p>
          {/* DocuSign JWT consent is handled server-side; we only need this UI
              on first setup flows. */}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end mb-6 ${
          loading ? "pointer-events-none opacity-70" : ""
        }`}
      >
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Search by Job
            </label>
            <SearchInput
              placeholder="Search by job title..."
              onSearch={(q) => {
                setJobSearch(q);
                setPage(1);
              }}
            />
          </div>
          <div className="w-full">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Filter by Job
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => {
                setSelectedJobId(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-3 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-200 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="all">All Jobs</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Filter by Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-3 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-200 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="counter">Counter Received</option>
            </select>
          </div>
      </div>

        {loading ? (
          <div className="text-slate-400 text-sm">Loading…</div>
        ) : (
          <>
            <div className="hidden md:block">
              <Table<OfferLetterRow>
                columns={[
                  {
                    header: "Candidate",
                    render: (row) => (
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-100 truncate">{row.candidateName}</div>
                        <div className="text-slate-400 text-xs truncate">{row.candidateEmail}</div>
                      </div>
                    ),
                    cellClassName: "p-4",
                  },
                  {
                    header: "Position",
                    render: (row) => (
                      <div className="text-slate-200">
                        {row.positionTitle ?? jobTitleMap.get(row.jobId) ?? row.jobId}
                      </div>
                    ),
                    cellClassName: "p-4",
                  },
                  {
                    header: "Salary",
                    render: (row) => <div className="text-emerald-400 font-medium">{row.salary ?? "—"}</div>,
                    cellClassName: "p-4",
                  },
                  {
                    header: "Sent Date",
                    render: (row) => (
                      <div>
                        <div className="text-slate-300">{formatDate(row.createdAt)}</div>
                        <div className="text-slate-500 text-xs">{formatTime(row.createdAt)}</div>
                      </div>
                    ),
                    cellClassName: "p-4",
                  },
                  {
                    header: "Status",
                    render: (row) => (
                      <div>
                        <StatusBadge status={row.status} />
                        {row.signedOfferAvailable ? (
                          <div className="text-[10px] text-emerald-400/90 mt-1 font-semibold uppercase tracking-wide">
                            Signed PDF
                          </div>
                        ) : null}
                      </div>
                    ),
                    cellClassName: "p-4",
                  },
                  {
                    header: "Actions",
                    headerClassName: "w-[140px]",
                    render: (row) => (
                      <Button
                        type="button"
                        variant="ghostOutline"
                        className="!px-3 !py-2 !text-xs"
                        onClick={() => setSelectedOffer(row)}
                      >
                        View Details
                      </Button>
                    ),
                    cellClassName: "p-4",
                  },
                ]}
                data={visibleRows}
                rowKey={(row) => row.id ?? `${row.applicationId}-${row.createdAt}`}
                emptyMessage="No offer letters yet"
                emptySubMessage="Send an offer from Applications or complete all interview rounds with passing scores (3+)."
              />
            </div>

            <div className="md:hidden space-y-3">
              {visibleRows.length === 0 ? (
                <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-8 text-center">
                  <p className="m-0 text-sm text-slate-300">No offer letters yet</p>
                  <p className="m-0 mt-1 text-xs text-slate-500">
                    Send an offer from Applications or complete all interview rounds with passing scores (3+).
                  </p>
                </div>
              ) : (
                visibleRows.map((row) => (
                  <div
                    key={row.id ?? `${row.applicationId}-${row.createdAt}`}
                    className="rounded-xl border border-slate-700 bg-slate-900/60 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="m-0 text-sm font-semibold text-slate-100 truncate">{row.candidateName}</h3>
                        <p className="m-0 mt-1 text-xs text-slate-400 truncate">{row.candidateEmail}</p>
                      </div>
                      <StatusBadge status={row.status} />
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                      <p className="m-0">
                        <span className="text-slate-500">Position:</span>{" "}
                        {row.positionTitle ?? jobTitleMap.get(row.jobId) ?? row.jobId}
                      </p>
                      <p className="m-0">
                        <span className="text-slate-500">Salary:</span> {row.salary ?? "—"}
                      </p>
                      <p className="m-0">
                        <span className="text-slate-500">Sent:</span> {formatDate(row.createdAt)} at {formatTime(row.createdAt)}
                      </p>
                      {row.signedOfferAvailable ? (
                        <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-emerald-400/90">
                          Signed PDF available
                        </p>
                      ) : null}
                    </div>

                    <Button
                      type="button"
                      variant="ghostOutline"
                      className="!mt-3 !w-full !px-3 !py-2 !text-xs"
                      onClick={() => setSelectedOffer(row)}
                    >
                      View Details
                    </Button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
        {!loading && totalPages > 1 ? (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            leftContent={paginationLeftContent}
          />
        ) : null}
      
    </div>
  );
}
