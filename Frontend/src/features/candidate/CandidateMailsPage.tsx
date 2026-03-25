import { type ReactNode } from "react";
import CandidateNavHeader from "./CandidateNavHeader";
import { Button, Pagination, SearchInput, Table } from "../../components/common";
import type { OfferMailboxStatus } from "../../services/candidateJobs.service";
import CounterProposalModal from "../../components/applications/CounterProposalModal";
import { useCandidateMails, type FilterType, type InboxItem } from "../../hooks/candidate/useCandidateMails";

function splitBenefits(benefits: string | undefined): string[] {
  if (!benefits?.trim()) return [];
  return benefits
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function renderLetterContent(text: string) {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return null;


  return (
    <pre className="m-0 whitespace-pre-wrap break-words font-serif text-[14px] leading-relaxed text-slate-200">
      {normalized}
    </pre>
  );
}

function formatEmailDate(dateStr: string) {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatOptionalDate(dateStr?: string) {
  if (!dateStr?.trim()) return undefined;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return formatEmailDate(d.toISOString());
}

function firstNameFromFullName(fullName?: string | null) {
  const v = fullName?.trim();
  if (!v) return "";
  const first = v.split(/\s+/)[0]?.trim() ?? "";
  // Remove common honorifics like "Mr." / "Ms."
  return first.replace(/^(Mr\.?|Ms\.?|Mrs\.?|Dr\.?)/i, "").trim();
}

function contentLooksLikeItHasClosing(text: string) {
  return /\b(Sincerely|Warm regards|Best regards|Regards|Cheers|Respectfully)\b/i.test(text);
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
  const {
    loading,
    error,
    filterType,
    setFilterType,
    offerStatusFilter,
    setOfferStatusFilter,
    setJobSearch,
    page,
    setPage,
    total,
    MAILBOX_PAGE_SIZE,
    filtered,
    selected,
    setSelectedKey,
    counterDraft,
    setCounterDraft,
    counterSubmitting,
    counterError,
    setCounterError,
    counterModalOpen,
    setCounterModalOpen,
    offerRespondBusy,
    offerRespondError,
    offerConsentNotice,
    signedPdfBusy,
    submitCounter,
    declineOffer,
    startAcceptSigning,
    openSignedOfferInNewTab,
    formatDate,
    formatTime,
    subjectFor,
  } = useCandidateMails();

  const shell = (children: ReactNode) => (
    <div className="flex min-h-screen w-full flex-col bg-[rgb(15,15,25)] text-slate-100">
      {children}
    </div>
  );

  if (loading && filtered.length === 0 && !selected) {
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

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="m-0 text-2xl font-bold text-slate-100">Inbox</h2>
              <p className="mt-1 text-sm text-slate-400">
                Offer letters and application updates from employers you applied to.
              </p>
            </div>
          </div>

          <div
            className={`flex flex-col sm:flex-row gap-3 items-stretch sm:items-end mb-6 ${
              loading ? "pointer-events-none opacity-70" : ""
            }`}
          >
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Search by Job</label>
              <SearchInput
                placeholder="Search by job title..."
                onSearch={(q) => {
                  setJobSearch(q);
                  setPage(1);
                }}
              />
            </div>
            <div className="sm:w-[180px]">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Filter by Type</label>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as FilterType);
                  setPage(1);
                }}
                className="w-full px-4 py-3 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-200 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              >
                <option value="all">All</option>
                <option value="offer">Offer</option>
                <option value="rejection">Rejection</option>
              </select>
            </div>
            <div className="sm:w-[220px]">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Filter by Status</label>
              <select
                value={offerStatusFilter}
                onChange={(e) => {
                  setOfferStatusFilter(e.target.value as OfferMailboxStatus | "all");
                  setPage(1);
                }}
                className="w-full px-4 py-3 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-200 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="counter">Counter sent</option>
              </select>
            </div>
          </div>

          <Table<InboxItem>
            columns={[
              {
                header: "Message",
                render: (mail) => (
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-100 truncate">{subjectFor(mail)}</div>
                    <div className="text-xs text-slate-400 mt-1 truncate">
                      From: <span className="text-slate-300 font-semibold">{mail.companyName}</span> • {mail.jobTitle}
                    </div>
                  </div>
                ),
                cellClassName: "p-4",
              },
              {
                header: "Sent",
                render: (mail) => (
                  <div className="text-xs text-slate-500">
                    {formatDate(mail.createdAt)} at {formatTime(mail.createdAt)}
                  </div>
                ),
              },
              {
                header: "Status",
                render: (mail) => {
                  if (mail.kind === "offer") {
                    return (
                      <div className="flex flex-wrap gap-2 items-center">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${offerResponseBadgeClass(
                            mail.status
                          )}`}
                        >
                          {offerResponseLabel(
                            mail.status,
                            mail.counterResponseStatus
                          )}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <span className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-red-500/20 text-red-300">
                      rejection
                    </span>
                  );
                },
              },
              {
                header: "Actions",
                render: (mail) => (
                  <Button
                    type="button"
                    variant="ghostOutline"
                    className="!px-3 !py-2 !text-xs"
                    onClick={() => setSelectedKey(mail.rowKey)}
                  >
                    Open
                  </Button>
                ),
                headerClassName: "w-[120px]",
              },
            ]}
            data={filtered}
            rowKey={(mail) => mail.rowKey}
            emptyMessage="No messages yet."
            emptySubMessage="When an employer sends an offer or rejection, it will appear here."
          />

          {total > 0 ? (
            <div className="mt-4">
              <Pagination
                page={page}
                totalPages={Math.max(1, Math.ceil(total / MAILBOX_PAGE_SIZE))}
                onPageChange={(next) => setPage(next)}
                leftContent={`Showing ${(page - 1) * MAILBOX_PAGE_SIZE + 1}–${Math.min(
                  page * MAILBOX_PAGE_SIZE,
                  total
                )} of ${total}`}
              />
            </div>
          ) : null}
        </main>
      </>
    );
  }

  const canSendCounter =
    selected.kind === "offer" && Boolean(selected.id) && selected.status === "pending";

  const canAcceptOrReject =
    selected.kind === "offer" && Boolean(selected.id) && selected.status === "pending";

  const recipientName = selected.candidateName?.trim() || "Candidate";
  const recipientEmail = selected.candidateEmail?.trim();
  const recipientFirstName = firstNameFromFullName(recipientName) || recipientName;

  const emailDate = formatEmailDate(selected.createdAt);
  const shouldAppendClosing = !contentLooksLikeItHasClosing(selected.content);
  const offerSignatoryName = selected.companyContactPerson?.trim() || selected.companyName;
  const benefitsList = selected.kind === "offer" ? splitBenefits(selected.benefits) : [];
  const showCounterLetter =
    selected.kind === "offer" && selected.status === "counter" && Boolean(selected.counterLetter?.trim());
  const offerStatusLabelInside =
    selected.kind === "offer"
      ? offerResponseLabel(
          selected.status,
          "counterResponseStatus" in selected ? selected.counterResponseStatus : undefined
        )
      : null;
  const shouldShowOfferDetails =
    selected.kind === "offer" &&
    (Boolean(selected.salary) ||
      Boolean(selected.location) ||
      Boolean(selected.startDate) ||
      benefitsList.length > 0);

  const offerDetails =
    selected.kind === "offer" && shouldShowOfferDetails ? (
      <dl className="mb-8 grid grid-cols-1 gap-x-10 gap-y-2 text-[12.5px] text-slate-200 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="m-0 text-[11px] font-semibold uppercase tracking-wide text-slate-300">
            Offer details
          </dt>
        </div>

        <div>
          <dt className="m-0 text-[11px] font-semibold uppercase tracking-wide text-slate-300">Position</dt>
          <dd className="m-0 mt-1 font-semibold">{selected.jobTitle}</dd>
        </div>

        {selected.salary ? (
          <div>
            <dt className="m-0 text-[11px] font-semibold uppercase tracking-wide text-slate-300">Salary</dt>
            <dd className="m-0 mt-1">{selected.salary}</dd>
          </div>
        ) : null}

        {selected.location ? (
          <div>
            <dt className="m-0 text-[11px] font-semibold uppercase tracking-wide text-slate-300">
              Work Location
            </dt>
            <dd className="m-0 mt-1">{selected.location}</dd>
          </div>
        ) : null}

        {selected.startDate ? (
          <div>
            <dt className="m-0 text-[11px] font-semibold uppercase tracking-wide text-slate-300">Start Date</dt>
            <dd className="m-0 mt-1">{formatOptionalDate(selected.startDate)}</dd>
          </div>
        ) : null}

        {benefitsList.length > 0 ? (
          <div className="sm:col-span-2">
            <dt className="m-0 text-[11px] font-semibold uppercase tracking-wide text-slate-300">Benefits</dt>
            <dd className="m-0 mt-1">{benefitsList.join(", ")}</dd>
          </div>
        ) : null}
      </dl>
    ) : null;

  return shell(
    <>
      <CandidateNavHeader title="MAIL DETAILS" currentPage="mails" />
      <main className="flex-1 px-6 py-8 sm:px-10">
        <Button
          type="button"
          variant="ghostOutline"
          onClick={() => setSelectedKey(null)}
          className="!mb-6 !flex !items-center !gap-2 !border-0 !bg-transparent !p-0 !text-sm !font-medium !text-slate-400 hover:!text-slate-200"
        >
          ← Back to inbox
        </Button>

        <div className="p-0 bg-transparent border-0">
          <div className="mb-6 border-b border-white/0 pb-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1" />
              {selected.kind === "offer" && selected.status === "accepted" && selected.signedOfferAvailable && selected.id ? (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="ghostOutline"
                    onClick={() => void openSignedOfferInNewTab()}
                    disabled={signedPdfBusy}
                    className="rounded-lg border border-slate-500/50 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:border-slate-400/60 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {signedPdfBusy ? "Opening…" : "View"}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>

            <div className="flex">
              <div className="flex-1">
                <div className="px-10 py-10">
                  <div className="mb-6">
                    <h3 className="m-0 w-full text-center text-[16px] font-bold text-slate-100">
                      {selected.kind === "offer" ? "Offer Letter" : "Rejection"}
                    </h3>
                    {offerStatusLabelInside ? (
                      <p className="m-0 mt-1 text-center text-[12px] font-semibold text-slate-200">
                        {offerStatusLabelInside}
                      </p>
                    ) : null}
                    <p className="m-0 mt-1 text-[12px] text-slate-300">
                      From: <span className="font-semibold text-slate-200">{selected.companyName}</span> •{" "}
                      {formatDate(selected.createdAt)} at {formatTime(selected.createdAt)}
                    </p>
                  </div>
                  <div className="mb-8 flex items-start justify-between gap-6">
                    <div>
                      <p className="m-0 text-[14px] font-semibold text-slate-100">{recipientName}</p>
                      {recipientEmail ? (
                        <p className="m-0 mt-1 text-[12px] text-slate-300">{recipientEmail}</p>
                      ) : null}
                    </div>
                    <p className="m-0 text-[12px] text-slate-300">{emailDate}</p>
                  </div>

                  <p className="m-0 mb-6 text-[14px] text-slate-200">Dear {recipientFirstName},</p>

                  {offerDetails}

                  {renderLetterContent(selected.content)}

                  {shouldAppendClosing ? (
                    <div className="mt-10">
                      <p className="m-0 font-semibold text-[14px] text-slate-200">Sincerely,</p>
                      <div className="mt-6 h-[2px] w-[140px] bg-emerald-500/50" />
                      <p className="m-0 mt-5 font-semibold text-[14px] text-slate-100">{offerSignatoryName}</p>
                      <p className="m-0 text-[12px] text-slate-300 mt-1">{selected.companyName}</p>
                      {selected.companyAddress ? (
                        <p className="m-0 text-[12px] text-slate-300 mt-1">{selected.companyAddress}</p>
                      ) : null}
                    </div>
                  ) : null}

                  {!showCounterLetter && selected.kind === "offer" ? (
                    <div className="mt-10 space-y-4 border-t border-sky-200/20 pt-6">
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
                        <Button
                          type="button"
                          variant="primary"
                          disabled={!canAcceptOrReject || offerRespondBusy !== false}
                          title={
                            !canAcceptOrReject
                              ? selected.status !== "pending"
                                ? "Only available while the offer is awaiting your response."
                                : "This message can’t be used to respond (missing id)."
                              : "Digitally sign in DocuSign; your acceptance is recorded only after signing."
                          }
                          onClick={() => void startAcceptSigning()}
                          className="order-1 !flex-1 rounded-xl border border-emerald-500/35 bg-emerald-600/15 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-600/25 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[140px]"
                        >
                          {offerRespondBusy === "sign" ? "Opening DocuSign…" : "Accept & sign"}
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
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
                          className="order-2 !flex-1 rounded-xl border border-red-500/35 bg-red-600/15 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-600/25 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[140px]"
                        >
                          {offerRespondBusy === "decline" ? "Declining…" : "Reject"}
                        </Button>
                        <Button
                          type="button"
                          variant="violet"
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
                          className="order-3 !flex-1 rounded-xl border border-violet-500/40 bg-gradient-to-r from-violet-600/80 to-purple-600/80 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/15 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[140px]"
                        >
                          Counter
                        </Button>
                      </div>

                      {!selected.id && (selected.status === "pending" || selected.status === "counter") ? (
                        <p className="m-0 text-sm text-amber-200/90">
                          Counter isn&apos;t available for this thread (missing message id). Contact the employer using the
                          letter if needed.
                        </p>
                      ) : null}

                      <p className="m-0 text-sm text-slate-300">
                        {selected.status === "counter"
                          ? "Your counter has been sent. Wait for the employer’s reply, or contact them if you need to follow up."
                          : "Accept opens DocuSign — the offer is marked accepted only after you finish signing. Reject declines immediately. Use Counter to propose different terms."}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
         

          {selected.kind === "offer" && selected.status === "counter" && selected.counterLetter?.trim() ? (
              <div className="flex">
                <div className="flex-1">
                  <div className="px-10 py-10">
                    <div className="mb-6">
                      <p className="m-0 text-[13px] font-bold text-slate-100">{subjectFor(selected)}</p>
                      <p className="m-0 mt-1 text-[12px] text-slate-300">
                        From: <span className="font-semibold text-slate-200">{selected.companyName}</span> •{" "}
                        {formatDate(selected.createdAt)} at {formatTime(selected.createdAt)}
                      </p>
                    </div>
                    <div className="mb-8 flex items-start justify-between gap-6">
                      <div>
                        <p className="m-0 text-[14px] font-semibold text-slate-100">{selected.companyName}</p>
                        <p className="m-0 mt-1 text-[12px] text-slate-300">{selected.companyContactPerson}</p>
                      </div>
                      <p className="m-0 text-[12px] text-slate-300">
                        {formatEmailDate(selected.counterSentAt ?? selected.createdAt)}
                      </p>
                    </div>

                    <p className="m-0 mb-6 text-[14px] text-slate-200">Dear Hiring Team,</p>
                    {offerDetails}
                    {renderLetterContent(selected.counterLetter)}

                    {selected.counterLetter && !contentLooksLikeItHasClosing(selected.counterLetter) ? (
                      <div className="mt-10">
                        <p className="m-0 font-semibold text-[14px] text-slate-200">Sincerely,</p>
                        <div className="mt-6 h-[2px] w-[140px] bg-emerald-500/50" />
                        <p className="m-0 mt-5 font-semibold text-[14px] text-slate-100">{recipientName}</p>
                      </div>
                    ) : null}

                    {showCounterLetter && (
                      <div className="mt-10 space-y-4 border-t border-sky-200/20 pt-6">
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
                          <Button
                            type="button"
                            variant="primary"
                            disabled={!canAcceptOrReject || offerRespondBusy !== false}
                            title={
                              !canAcceptOrReject
                                ? selected.id
                                  ? "Only available while the offer is awaiting your response."
                                  : "This message can’t be used to respond (missing id)."
                                : "Digitally sign in DocuSign; your acceptance is recorded only after signing."
                            }
                            onClick={() => void startAcceptSigning()}
                            className="order-1 !flex-1 rounded-xl border border-emerald-500/35 bg-emerald-600/15 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-600/25 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[140px]"
                          >
                            {offerRespondBusy === "sign" ? "Opening DocuSign…" : "Accept & sign"}
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            disabled={!canAcceptOrReject || offerRespondBusy !== false}
                            title={
                              !canAcceptOrReject
                                ? selected.id
                                  ? "Only available while the offer is awaiting your response."
                                  : "This message can’t be used to respond (missing id)."
                                : "Decline this offer"
                            }
                            onClick={() => {
                              if (!canAcceptOrReject) return;
                              if (!window.confirm("Decline this offer? The employer will see that you declined.")) return;
                              void declineOffer();
                            }}
                            className="order-2 !flex-1 rounded-xl border border-red-500/35 bg-red-600/15 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-600/25 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[140px]"
                          >
                            {offerRespondBusy === "decline" ? "Declining…" : "Reject"}
                          </Button>
                          <Button
                            type="button"
                            variant="violet"
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
                            className="order-3 !flex-1 rounded-xl border border-violet-500/40 bg-gradient-to-r from-violet-600/80 to-purple-600/80 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/15 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[140px]"
                          >
                            Counter
                          </Button>
                        </div>

                        {!selected.id && selected.status === "counter" ? (
                          <p className="m-0 text-sm text-amber-200/90">
                            Counter isn&apos;t available for this thread (missing message id). Contact the employer using the
                            letter if needed.
                          </p>
                        ) : null}

                        <p className="m-0 text-sm text-slate-300">
                          {selected.status === "counter"
                            ? "Your counter has been sent. Wait for the employer’s reply, or contact them if you need to follow up."
                            : "Accept opens DocuSign — the offer is marked accepted only after you finish signing. Reject declines immediately. Use Counter to propose different terms."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
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
