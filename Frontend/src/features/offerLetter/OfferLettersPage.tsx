import { Button, Pagination, SearchInput, Table } from "../../components/common";
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
    refreshOffers,
    jobTitleMap,
    totalPages,
    paginationLeftContent,
  } = useOfferLetters();

  const visibleRows = rows;
 

  // Detail view
  if (selectedOffer) {
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

        <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-slate-900/95 to-slate-800/90 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-8 py-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white m-0">{selectedOffer.candidateName}</h2>
                <p className="text-white/90 text-sm mt-1.5 m-0">{selectedOffer.candidateEmail}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={selectedOffer.status} />
                {selectedOffer.status === "accepted" &&
                selectedOffer.signedOfferAvailable &&
                selectedOffer.id ? (
                  <Button
                    type="button"
                    onClick={() => void openEmployerSignedPdfInNewTab()}
                    disabled={signedPdfBusy}
                    className="rounded-lg border border-white/40 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {signedPdfBusy ? "Opening…" : "View"}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {signedPdfError ? (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {signedPdfError}
              </div>
            ) : null}
            {/* Offer details */}
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
              <h3 className="text-violet-300 font-semibold text-base mb-4">Offer Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-slate-400 text-xs mb-1">Position</div>
                  <div className="text-slate-100 font-medium">
                    {jobTitleMap.get(selectedOffer.jobId) ?? selectedOffer.jobId}
                  </div>
                </div>
                {selectedOffer.salary && (
                  <div>
                    <div className="text-slate-400 text-xs mb-1">Salary</div>
                    <div className="text-slate-100 font-medium">{selectedOffer.salary}</div>
                  </div>
                )}
                {selectedOffer.startDate && (
                  <div>
                    <div className="text-slate-400 text-xs mb-1">Start Date</div>
                    <div className="text-slate-100 font-medium">{selectedOffer.startDate}</div>
                  </div>
                )}
                {selectedOffer.location && (
                  <div>
                    <div className="text-slate-400 text-xs mb-1">Location</div>
                    <div className="text-slate-100 font-medium">{selectedOffer.location}</div>
                  </div>
                )}
                <div>
                  <div className="text-slate-400 text-xs mb-1">Sent On</div>
                  <div className="text-slate-100 font-medium">
                    {formatDate(selectedOffer.createdAt)} {formatTime(selectedOffer.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Offer content */}
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-5">
              <h3 className="text-slate-200 font-semibold text-base mb-3">Offer Letter Content</h3>
              <pre className="whitespace-pre-wrap text-slate-300 text-sm font-sans m-0 leading-relaxed">
                {selectedOffer.content}
              </pre>
            </div>

            {/* Counter letter */}
            {selectedOffer.status === "counter" && selectedOffer.counterLetter?.trim() && (
              <div className="rounded-xl border-2 border-amber-500/30 bg-amber-500/5 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold">
                    C
                  </div>
                  <div>
                    <h3 className="text-amber-400 font-bold text-lg m-0">Counter Proposal Received</h3>
                    {selectedOffer.counterSentAt && (
                      <p className="text-slate-400 text-xs m-0 mt-0.5">
                        Submitted on {formatDate(selectedOffer.counterSentAt)} at{" "}
                        {formatTime(selectedOffer.counterSentAt)}
                      </p>
                    )}
                  </div>
                </div>
                <pre className="whitespace-pre-wrap text-slate-300 text-sm font-sans m-0 max-h-48 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/80 p-3">
                  {selectedOffer.counterLetter}
                </pre>
                <div className="mt-6 pt-5 border-t border-amber-500/20 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="ghostOutline"
                    disabled={!!counterResponding}
                    onClick={() => void respondToCounter("accept")}
                    className="flex-1 min-w-[140px] py-3 px-5 rounded-lg font-semibold text-sm bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {counterResponding === "accept" ? "Processing…" : "Accept Counter"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghostOutline"
                    disabled={!!counterResponding}
                    onClick={() => void respondToCounter("reject")}
                    className="flex-1 min-w-[140px] py-3 px-5 rounded-lg font-semibold text-sm border border-red-500/60 bg-red-500/10 text-red-200 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {counterResponding === "reject" ? "Processing…" : "Reject Counter"}
                  </Button>
                </div>
              </div>
            )}

            {/* Status messages */}
            {selectedOffer.status === "accepted" && (
              <div className="rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-2xl text-white mx-auto mb-4">
                  ✓
                </div>
                <h3 className="text-emerald-400 font-bold text-xl m-0 mb-2">Offer Accepted</h3>
                <p className="text-slate-400 text-sm m-0">
                  Candidate has accepted the offer. Proceed with onboarding process.
                </p>
              </div>
            )}

            {selectedOffer.status === "declined" && (
              <div className="rounded-xl border-2 border-red-500/30 bg-red-500/5 p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-2xl text-white mx-auto mb-4">
                  ✕
                </div>
                <h3 className="text-red-400 font-bold text-xl m-0 mb-2">Offer Declined</h3>
                <p className="text-slate-400 text-sm m-0">
                  Candidate has declined this offer. Consider other shortlisted candidates.
                </p>
              </div>
            )}

            {selectedOffer.status === "pending" && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl text-white mx-auto mb-4">
                  ⏳
                </div>
                <h3 className="text-amber-400 font-bold text-xl m-0 mb-2">Awaiting Response</h3>
                <p className="text-slate-400 text-sm m-0">
                  Candidate has not yet responded to this offer letter.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 m-0">Offer Letters</h1>
          <p className="text-slate-400 text-sm mt-2 mb-0">
            Track all sent offer letters and candidate responses. Data from Applications workflow.
          </p>
          {/* DocuSign JWT consent is handled server-side; we only need this UI
              on first setup flows. */}
        </div>
        <Button
          variant="secondary"
          className="bg-slate-800 border-slate-700 text-slate-200 shrink-0"
          type="button"
          onClick={() => void refreshOffers()}
          disabled={loading}
        >
          {loading ? "Loading…" : "Refresh"}
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div
        className={`flex flex-col sm:flex-row gap-3 items-stretch sm:items-end mb-6 ${
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
          <div className="sm:w-[220px]">
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
          <div className="sm:w-[220px]">
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

      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6">
        {loading ? (
          <div className="text-slate-400 text-sm">Loading…</div>
        ) : (
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
                  <div className="text-slate-200">{jobTitleMap.get(row.jobId) ?? row.jobId}</div>
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
    </div>
  );
}
