import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import CandidateNavHeader from "./CandidateNavHeader";
import {
  candidateJobsService,
  type CandidateMailboxData,
  type OfferMailboxStatus,
} from "../../services/candidateJobs.service";
import { extractApiError } from "../../api/axios";
import CounterProposalModal from "../../components/applications/CounterProposalModal";
type FilterType = "all" | "offer" | "rejection";

type InboxItem =
  | (CandidateMailboxData["offers"][number] & { kind: "offer"; rowKey: string })
  | (CandidateMailboxData["rejections"][number] & { kind: "rejection"; rowKey: string });

function splitBenefits(benefits: string | undefined): string[] {
  if (!benefits?.trim()) return [];
  return benefits
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function offerResponseBadgeClass(s: OfferMailboxStatus) {
  switch (s) {
    case "accepted":
      return "bg-emerald-500/20 text-emerald-300";
    case "declined":
      return "bg-red-500/20 text-red-300";
    case "counter":
      return "bg-sky-500/20 text-sky-200";
    default:
      return "bg-amber-500/20 text-amber-200";
  }
}

function offerResponseLabel(
  s: OfferMailboxStatus,
  counterResponseStatus?: "accepted" | "rejected"
) {
  if (s === "accepted" && counterResponseStatus === "accepted") {
    return "Counter accepted";
  }
  if (s === "declined" && counterResponseStatus === "rejected") {
    return "Counter rejected";
  }
  switch (s) {
    case "accepted":
      return "Accepted";
    case "declined":
      return "Declined";
    case "counter":
      return "Counter sent";
    default:
      return "Awaiting your response";
  }
}

export default function CandidateMailsPage() {
  const [data, setData] = useState<CandidateMailboxData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [counterDraft, setCounterDraft] = useState("");
  const [counterSubmitting, setCounterSubmitting] = useState(false);
  const [counterError, setCounterError] = useState<string | null>(null);
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [offerRespondBusy, setOfferRespondBusy] = useState<false | "decline" | "sign">(false);
  const [offerRespondError, setOfferRespondError] = useState<string | null>(null);
  /** One-time DocuSign JWT consent — must be completed by the DocuSign integration user (not necessarily the candidate). */
  const [offerConsentNotice, setOfferConsentNotice] = useState<string | null>(null);
  const [signedPdfBusy, setSignedPdfBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await candidateJobsService.listMailbox();
      setData(res);
    } catch {
      setError("Could not load your messages.");
      setData({ offers: [], rejections: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const items: InboxItem[] = useMemo(() => {
    if (!data) return [];
    const offers: InboxItem[] = data.offers.map((o) => ({
      ...o,
      kind: "offer" as const,
      rowKey: `offer:${o.id ?? o.applicationId}:${o.createdAt}`,
    }));
    const rejections: InboxItem[] = data.rejections.map((r) => ({
      ...r,
      kind: "rejection" as const,
      rowKey: `rejection:${r.id ?? r.applicationId}:${r.createdAt}`,
    }));
    return [...offers, ...rejections].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [data]);

  const filtered = useMemo(() => {
    if (filterType === "all") return items;
    return items.filter((m) => m.kind === filterType);
  }, [items, filterType]);

  const selected = selectedKey ? items.find((m) => m.rowKey === selectedKey) : undefined;

  useEffect(() => {
    setOfferRespondError(null);
    if (!selected || selected.kind !== "offer") {
      setCounterDraft("");
      setCounterError(null);
      return;
    }
    setCounterDraft(selected.status === "counter" ? (selected.counterLetter ?? "") : "");
    setCounterError(null);
  }, [selected]);

  useEffect(() => {
    if (!counterModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCounterModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [counterModalOpen]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const subjectFor = (m: InboxItem) =>
    m.kind === "offer" ? `Offer — ${m.jobTitle}` : `Update — ${m.jobTitle}`;

  const submitCounter = useCallback(async () => {
    if (selected?.kind !== "offer" || !selected.id) return;
    const letter = counterDraft.trim();
    if (!letter) return;
    setCounterSubmitting(true);
    setCounterError(null);
    try {
      await candidateJobsService.submitOfferCounter(selected.id, letter);
      setCounterModalOpen(false);
      await load();
    } catch {
      setCounterError("Could not send your counter proposal. Please try again.");
    } finally {
      setCounterSubmitting(false);
    }
  }, [selected, counterDraft, load]);

  const declineOffer = useCallback(async () => {
    if (selected?.kind !== "offer" || !selected.id) return;
    setOfferRespondError(null);
    setOfferConsentNotice(null);
    setOfferRespondBusy("decline");
    try {
      await candidateJobsService.respondToOffer(selected.id, "decline");
      await load();
    } catch (e) {
      setOfferRespondError(extractApiError(e));
    } finally {
      setOfferRespondBusy(false);
    }
  }, [selected, load]);

  const startAcceptSigning = useCallback(async () => {
    if (selected?.kind !== "offer" || !selected.id) return;
    setOfferRespondError(null);
    setOfferConsentNotice(null);
    setOfferRespondBusy("sign");
    try {
      const result = await candidateJobsService.beginOfferSigning(selected.id);
      if (result.outcome === "accepted") {
        await load();
        setOfferRespondBusy(false);
        return;
      }
      if (result.outcome === "consent_required") {
        setOfferConsentNotice(
          "Offer signing isn’t available yet: DocuSign must be activated once by your employer (JWT consent). Candidates don’t use the DocuSign login page — after setup, you’ll go straight to signing. Ask HR to open Connect DocuSign from the employer portal, then try again."
        );
        setOfferRespondBusy(false);
        return;
      }
      const url = result.signingUrl;
      if (url.includes("/oauth/auth")) {
        setOfferRespondError(
          "Received a DocuSign login link instead of a signing session. The employer must complete DocuSign setup first."
        );
        setOfferRespondBusy(false);
        return;
      }
      window.location.assign(url);
    } catch (e) {
      setOfferRespondError(extractApiError(e));
      setOfferRespondBusy(false);
    }
  }, [selected, load]);

  const openSignedOfferInNewTab = useCallback(async () => {
    if (selected?.kind !== "offer" || !selected.id) return;
    setSignedPdfBusy(true);
    setOfferRespondError(null);
    try {
      const blob = await candidateJobsService.fetchOfferSignedPdf(selected.id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      setOfferRespondError(extractApiError(e));
    } finally {
      setSignedPdfBusy(false);
    }
  }, [selected]);

  const shell = (children: ReactNode) => (
    <div className="flex min-h-screen w-full flex-col bg-[rgb(15,15,25)] text-slate-100">
      {children}
    </div>
  );

  if (loading && !data) {
    return shell(
      <>
        <CandidateNavHeader title="MAILS" currentPage="mails" />
        <main className="flex-1 px-6 py-8 sm:px-10">
          <p className="text-slate-400 text-sm">Loading your inbox…</p>
        </main>
      </>
    );
  }

  if (!selected) {
    return shell(
      <>
        <CandidateNavHeader title="MAILS" currentPage="mails" />
        <main className="flex-1 px-6 py-8 sm:px-10">
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="m-0 text-2xl font-bold text-slate-100">Inbox</h2>
              <p className="mt-1 text-sm text-slate-400">
                Offer letters and application updates from employers you applied to.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "offer", "rejection"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilterType(type)}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold capitalize transition-colors ${
                    filterType === type
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-900/40"
                      : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-14 text-center">
                <p className="m-0 text-slate-400 text-sm">
                  No messages yet. When an employer sends an offer or rejection, it will appear here.
                </p>
              </div>
            ) : (
              filtered.map((mail) => (
                <button
                  key={mail.rowKey}
                  type="button"
                  onClick={() => setSelectedKey(mail.rowKey)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-violet-500/40 hover:bg-white/[0.07] hover:translate-x-0.5"
                >
                  <div className="flex gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg ${
                        mail.kind === "offer"
                          ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                          : "bg-gradient-to-br from-red-500 to-rose-600"
                      }`}
                    >
                      {mail.kind === "offer" ? "📧" : "📩"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                        <h3 className="m-0 truncate text-base font-semibold text-slate-100">
                          {subjectFor(mail)}
                        </h3>
                        <div className="flex shrink-0 flex-wrap items-center gap-1.5 justify-end">
                          {mail.kind === "offer" && (
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${offerResponseBadgeClass(
                                mail.status
                              )}`}
                            >
                              {offerResponseLabel(
                                mail.status,
                                "counterResponseStatus" in mail ? mail.counterResponseStatus : undefined
                              )}
                            </span>
                          )}
                          <span
                            className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                              mail.kind === "offer"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {mail.kind}
                          </span>
                        </div>
                      </div>
                      <div className="mb-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span>
                          From: <strong className="text-slate-300">{mail.companyName}</strong>
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>{mail.jobTitle}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatDate(mail.createdAt)} at {formatTime(mail.createdAt)}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </main>
      </>
    );
  }

  const benefitTags =
    selected.kind === "offer" ? splitBenefits(selected.benefits) : [];

  const canSendCounter =
    selected.kind === "offer" && Boolean(selected.id) && selected.status === "pending";

  const canAcceptOrReject =
    selected.kind === "offer" && Boolean(selected.id) && selected.status === "pending";

  return shell(
    <>
      <CandidateNavHeader title="MAIL DETAILS" currentPage="mails" />
      <main className="flex-1 px-6 py-8 sm:px-10">
        <button
          type="button"
          onClick={() => setSelectedKey(null)}
          className="mb-6 flex items-center gap-2 border-0 bg-transparent p-0 text-sm font-medium text-slate-400 hover:text-slate-200"
        >
          ← Back to inbox
        </button>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-6 border-b border-white/10 pb-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="m-0 text-xl font-bold text-slate-100">{subjectFor(selected)}</h2>
              {selected.kind === "offer" && (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${offerResponseBadgeClass(
                      selected.status
                    )}`}
                  >
                    {offerResponseLabel(
                      selected.status,
                      "counterResponseStatus" in selected ? selected.counterResponseStatus : undefined
                    )}
                  </span>
                  {selected.status === "accepted" && selected.signedOfferAvailable && selected.id ? (
                    <button
                      type="button"
                      onClick={() => void openSignedOfferInNewTab()}
                      disabled={signedPdfBusy}
                      className="rounded-lg border border-slate-500/50 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:border-slate-400/60 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {signedPdfBusy ? "Opening…" : "View"}
                    </button>
                  ) : null}
                </div>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
              <span>
                From: <strong className="text-slate-300">{selected.companyName}</strong>
              </span>
              <span>•</span>
              <span>
                {formatDate(selected.createdAt)} at {formatTime(selected.createdAt)}
              </span>
            </div>
          </div>

          {selected.kind === "offer" && (
            <div className="mb-6 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-600/5 p-5">
              <h3 className="m-0 mb-4 text-base font-bold text-emerald-400">Offer details</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {selected.salary ? (
                  <div>
                    <div className="mb-1 text-xs text-slate-400">Salary</div>
                    <div className="text-sm font-semibold text-slate-100">{selected.salary}</div>
                  </div>
                ) : null}
                {selected.startDate ? (
                  <div>
                    <div className="mb-1 text-xs text-slate-400">Start date</div>
                    <div className="text-sm font-semibold text-slate-100">{selected.startDate}</div>
                  </div>
                ) : null}
                {selected.location ? (
                  <div>
                    <div className="mb-1 text-xs text-slate-400">Location</div>
                    <div className="text-sm font-semibold text-slate-100">{selected.location}</div>
                  </div>
                ) : null}
              </div>
              {benefitTags.length > 0 && (
                <div className="mt-4">
                  <div className="mb-2 text-xs text-slate-400">Benefits</div>
                  <div className="flex flex-wrap gap-2">
                    {benefitTags.map((b) => (
                      <span
                        key={b}
                        className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mb-6 rounded-xl bg-white/[0.03] p-5">
            <div className="text-slate-500 text-xs font-medium mb-1">Employer offer</div>
            <pre className="m-0 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-slate-300">
              {selected.content}
            </pre>
          </div>

          {selected.kind === "offer" && selected.status === "counter" && selected.counterLetter?.trim() ? (
            <div className="mb-6 rounded-xl border border-sky-500/30 bg-sky-950/20 p-5">
              <div className="text-sky-300 text-xs font-semibold mb-2">Counter sent</div>
              {selected.counterSentAt ? (
                <div className="text-slate-500 text-xs mb-2">
                  Sent {formatDate(selected.counterSentAt)} at {formatTime(selected.counterSentAt)}
                </div>
              ) : null}
              <pre className="m-0 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-slate-200">
                {selected.counterLetter}
              </pre>
            </div>
          ) : null}

          {selected.kind === "offer" &&
          selected.counterLetter?.trim() &&
          selected.counterResponseStatus === "accepted" ? (
            <div className="mb-6 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/10 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white text-lg font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="m-0 text-emerald-300 font-bold">Counter accepted</h3>
                  <p className="m-0 mt-0.5 text-sm text-slate-400">
                    The company has accepted your counter proposal. Proceed with onboarding as discussed.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {selected.kind === "offer" &&
          selected.counterLetter?.trim() &&
          selected.counterResponseStatus === "rejected" ? (
            <div className="mb-6 rounded-xl border-2 border-red-500/30 bg-red-500/10 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white text-lg font-bold">
                  ✕
                </div>
                <div>
                  <h3 className="m-0 text-red-300 font-bold">Counter rejected</h3>
                  <p className="m-0 mt-0.5 text-sm text-slate-400">
                    The company has declined your counter proposal. You may reach out to discuss further if needed.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {selected.kind === "offer" && (
            <div className="space-y-4">
              {offerConsentNotice ? (
                <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  {offerConsentNotice}
                </div>
              ) : null}
              {offerRespondError ? (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {offerRespondError}
                </div>
              ) : null}
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <button
                  type="button"
                  disabled={!canAcceptOrReject || offerRespondBusy !== false}
                  title={
                    !canAcceptOrReject
                      ? selected.status !== "pending"
                        ? "Only available while the offer is awaiting your response."
                        : "This message can’t be used to respond (missing id)."
                      : "Digitally sign in DocuSign; your acceptance is recorded only after signing."
                  }
                  onClick={() => void startAcceptSigning()}
                  className="order-1 flex-1 rounded-xl border border-emerald-500/40 bg-emerald-600/20 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-600/30 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[140px]"
                >
                  {offerRespondBusy === "sign" ? "Opening DocuSign…" : "Accept & sign"}
                </button>
                <button
                  type="button"
                  disabled={!canAcceptOrReject || offerRespondBusy !== false}
                  title={
                    !canAcceptOrReject
                      ? selected.status !== "pending"
                        ? "Only available while the offer is awaiting your response."
                        : "This message can’t be used to respond (missing id)."
                      : "Decline this offer"
                  }
                  onClick={() => {
                    if (!canAcceptOrReject) return;
                    if (!window.confirm("Decline this offer? The employer will see that you declined.")) return;
                    void declineOffer();
                  }}
                  className="order-2 flex-1 rounded-xl border border-red-500/40 bg-red-600/15 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-600/25 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[140px]"
                >
                  {offerRespondBusy === "decline" ? "Declining…" : "Reject"}
                </button>
                <button
                  type="button"
                  disabled={!canSendCounter}
                  title={
                    !canSendCounter
                      ? selected.id
                        ? "You can’t send another response for this offer."
                        : "This message can’t be used to send a counter (missing id)."
                      : "Propose different terms in writing"
                  }
                  onClick={() => {
                    setCounterError(null);
                    setCounterModalOpen(true);
                  }}
                  className="order-3 flex-1 rounded-xl border border-violet-500/50 bg-gradient-to-r from-violet-600/90 to-purple-600/90 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/25 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[140px]"
                >
                  Counter
                </button>
              </div>

              {!selected.id && (selected.status === "pending" || selected.status === "counter") ? (
                <p className="m-0 text-sm text-amber-200/90">
                  Counter isn&apos;t available for this thread (missing message id). Contact the employer using the
                  letter if needed.
                </p>
              ) : null}

              <p className="m-0 text-sm text-slate-500">
                {selected.status === "counter"
                  ? "Your counter has been sent. Wait for the employer’s reply, or contact them if you need to follow up."
                  : "Accept opens DocuSign — the offer is marked accepted only after you finish signing. Reject declines immediately. Use Counter to propose different terms."}
              </p>
            </div>
          )}
        </div>
      </main>

      {counterModalOpen && selected?.kind === "offer" && (
        <CounterProposalModal
          isOpen={counterModalOpen}
          onClose={() => {
            setCounterModalOpen(false);
            setCounterError(null);
          }}
          onConfirm={submitCounter}
          companyName={selected.companyName}
          jobTitle={selected.jobTitle}
          salary={selected.salary}
          location={selected.location}
          startDate={selected.startDate}
          benefits={selected.benefits}
          letterContent={counterDraft}
          onLetterContentChange={setCounterDraft}
          error={counterError}
          isLoading={counterSubmitting}
        />
      )}
    </>
  );
}
