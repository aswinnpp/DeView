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
        <Button
          type="button"
          variant="ghostOutline"
          onClick={() => setSelectedKey(null)}
          className="!mb-6 !flex !items-center !gap-2 !border-0 !bg-transparent !p-0 !text-sm !font-medium !text-slate-400 hover:!text-slate-200"
        >
          ← Back to inbox
        </Button>

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
                    <Button
                      type="button"
                      variant="ghostOutline"
                      onClick={() => void openSignedOfferInNewTab()}
                      disabled={signedPdfBusy}
                      className="rounded-lg border border-slate-500/50 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:border-slate-400/60 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {signedPdfBusy ? "Opening…" : "View"}
                    </Button>
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
                  className="order-1 !flex-1 rounded-xl border border-emerald-500/40 bg-emerald-600/20 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-600/30 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[140px]"
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
                  className="order-2 !flex-1 rounded-xl border border-red-500/40 bg-red-600/15 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-600/25 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[140px]"
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
                  className="order-3 !flex-1 rounded-xl border border-violet-500/50 bg-gradient-to-r from-violet-600/90 to-purple-600/90 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/25 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[140px]"
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
