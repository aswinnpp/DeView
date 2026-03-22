import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../components/common/Button";
import { applicationsService } from "../../services/applications.service";
import type { JobListItem } from "../../services/applications.service";

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
  const [rows, setRows] = useState<OfferLetterRow[]>([]);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<OfferLetterRow | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [counterResponding, setCounterResponding] = useState<string | null>(null);

  const load = useCallback(async (): Promise<OfferLetterRow[]> => {
    setLoading(true);
    setError(null);
    try {
      const [offerData, jobsResult] = await Promise.all([
        applicationsService.listOfferMails(),
        applicationsService.listJobs({ limit: 500 }),
      ]);
      const normalized = offerData.map((r) => ({
        ...r,
        status:
          r.status === "accepted" ||
          r.status === "declined" ||
          r.status === "pending" ||
          r.status === "counter"
            ? r.status
            : "pending",
      }));
      setRows(normalized);
      setJobs(jobsResult.data ?? []);
      return normalized;
    } catch {
      setError("Could not load offer letters.");
      setRows([]);
      setJobs([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const jobTitleMap = useMemo(() => {
    const m = new Map<string, string>();
    jobs.forEach((j) => m.set(j.id, j.title));
    return m;
  }, [jobs]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const jobMatch = selectedJobId === "all" || r.jobId === selectedJobId;
      const statusMatch = selectedStatus === "all" || r.status === selectedStatus;
      return jobMatch && statusMatch;
    });
  }, [rows, selectedJobId, selectedStatus]);

  const uniqueJobIds = useMemo(() => {
    const ids = new Set(rows.map((r) => r.jobId));
    return Array.from(ids);
  }, [rows]);

  // Detail view
  if (selectedOffer) {
    return (
      <div className="w-full">
        <header className="flex items-start justify-between gap-4 mb-6">
          <div>
            <button
              type="button"
              onClick={() => setSelectedOffer(null)}
              className="text-slate-400 hover:text-slate-200 text-sm font-medium mb-2 inline-flex items-center gap-1.5"
            >
              ← Back to list
            </button>
            <h1 className="text-2xl font-bold text-slate-50 m-0">Offer Letter Details</h1>
            <p className="text-slate-400 text-sm mt-2 mb-0">
              View offer details and candidate response
            </p>
          </div>
        </header>

        <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-slate-900/95 to-slate-800/90 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-8 py-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-white m-0">{selectedOffer.candidateName}</h2>
                <p className="text-white/90 text-sm mt-1.5 m-0">{selectedOffer.candidateEmail}</p>
              </div>
              <StatusBadge status={selectedOffer.status} />
            </div>
          </div>

          <div className="p-6 space-y-6">
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
                  <button
                    type="button"
                    disabled={!!counterResponding}
                    onClick={async () => {
                      if (!selectedOffer.id) return;
                      setCounterResponding("accept");
                      try {
                        await applicationsService.respondToCounterLetter(selectedOffer.id, "accept");
                        const refreshed = await load();
                        const updated = refreshed.find((r) => r.id === selectedOffer.id);
                        setSelectedOffer(updated ?? null);
                      } finally {
                        setCounterResponding(null);
                      }
                    }}
                    className="flex-1 min-w-[140px] py-3 px-5 rounded-lg font-semibold text-sm bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {counterResponding === "accept" ? "Processing…" : "Accept Counter"}
                  </button>
                  <button
                    type="button"
                    disabled={!!counterResponding}
                    onClick={async () => {
                      if (!selectedOffer.id) return;
                      if (!window.confirm("Are you sure you want to reject this counter proposal? The candidate will be notified.")) return;
                      setCounterResponding("reject");
                      try {
                        await applicationsService.respondToCounterLetter(selectedOffer.id, "reject");
                        const refreshed = await load();
                        const updated = refreshed.find((r) => r.id === selectedOffer.id);
                        setSelectedOffer(updated ?? null);
                      } finally {
                        setCounterResponding(null);
                      }
                    }}
                    className="flex-1 min-w-[140px] py-3 px-5 rounded-lg font-semibold text-sm border border-red-500/60 bg-red-500/10 text-red-200 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {counterResponding === "reject" ? "Processing…" : "Reject Counter"}
                  </button>
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
        </div>
        <Button
          variant="secondary"
          className="bg-slate-800 border-slate-700 text-slate-200 shrink-0"
          type="button"
          onClick={() => void load()}
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
      {!loading && rows.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Filter by Job
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-slate-200 text-sm outline-none focus:border-violet-500"
            >
              <option value="all">All Jobs</option>
              {uniqueJobIds.map((jid) => (
                <option key={jid} value={jid}>
                  {jobTitleMap.get(jid) ?? jid}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Filter by Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-slate-200 text-sm outline-none focus:border-violet-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="counter">Counter Received</option>
            </select>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6">
        {loading ? (
          <div className="text-slate-400 text-sm">Loading…</div>
        ) : filteredRows.length === 0 ? (
          <>
            <div className="text-slate-300 font-semibold">No offer letters yet</div>
            <div className="text-slate-400 text-sm mt-1">
              Send an offer from Applications or complete all interview rounds with passing scores (3+).
            </div>
          </>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="py-3 px-3 text-slate-300 font-semibold text-sm">Candidate</th>
                  <th className="py-3 px-3 text-slate-300 font-semibold text-sm">Position</th>
                  <th className="py-3 px-3 text-slate-300 font-semibold text-sm">Salary</th>
                  <th className="py-3 px-3 text-slate-300 font-semibold text-sm">Sent Date</th>
                  <th className="py-3 px-3 text-slate-300 font-semibold text-sm">Status</th>
                  <th className="py-3 px-3 text-slate-300 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr
                    key={row.id ?? `${row.applicationId}-${row.createdAt}`}
                    className="border-b border-slate-800/80 hover:bg-slate-800/30"
                  >
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-100">{row.candidateName}</div>
                      <div className="text-slate-400 text-xs">{row.candidateEmail}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-200">
                      {jobTitleMap.get(row.jobId) ?? row.jobId}
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-medium">
                      {row.salary ?? "—"}
                    </td>
                    <td className="py-3 px-3 text-slate-300 text-sm">
                      <div>{formatDate(row.createdAt)}</div>
                      <div className="text-slate-500 text-xs">{formatTime(row.createdAt)}</div>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => setSelectedOffer(row)}
                        className="px-4 py-2 rounded-lg border border-violet-500/50 bg-violet-500/10 text-violet-300 font-semibold text-sm hover:bg-violet-500/20 transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
