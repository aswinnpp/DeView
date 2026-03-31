import { useCallback, useEffect, useMemo, useState } from "react";
import { extractApiError } from "../../api/axios";
import {
  candidateJobsService,
  type CandidateMailboxData,
  type OfferMailboxStatus,
} from "../../services/candidateJobs.service";

export type FilterType = "all" | "offer" | "rejection";

export type InboxItem =
  | (CandidateMailboxData["offers"][number] & { kind: "offer"; rowKey: string })
  | (CandidateMailboxData["rejections"][number] & { kind: "rejection"; rowKey: string });

export function useCandidateMails() {
  const [data, setData] = useState<CandidateMailboxData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const [filterType, setFilterType] = useState<FilterType>("all");
  const [offerStatusFilter, setOfferStatusFilter] = useState<OfferMailboxStatus | "all">("all");
  const [jobSearch, setJobSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const MAILBOX_PAGE_SIZE = 10;

  // Counter proposal modal state
  const [counterDraft, setCounterDraft] = useState("");
  const [counterJobTitleDraft, setCounterJobTitleDraft] = useState("");
  const [counterSalaryDraft, setCounterSalaryDraft] = useState<string | undefined>(undefined);
  const [counterLocationDraft, setCounterLocationDraft] = useState<string | undefined>(undefined);
  const [counterStartDateDraft, setCounterStartDateDraft] = useState<string | undefined>(undefined);
  const [counterBenefitsDraft, setCounterBenefitsDraft] = useState<string | undefined>(undefined);
  const [counterSubmitting, setCounterSubmitting] = useState(false);
  const [counterError, setCounterError] = useState<string | null>(null);
  const [counterModalOpen, setCounterModalOpen] = useState(false);

  // Offer actions state
  const [offerRespondBusy, setOfferRespondBusy] = useState<false | "decline" | "sign">(false);
  const [offerRespondError, setOfferRespondError] = useState<string | null>(null);
  /** DocuSign consent notice (shown when backend requires employer JWT setup). */
  const [offerConsentNotice, setOfferConsentNotice] = useState<string | null>(null);
  const [signedPdfBusy, setSignedPdfBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await candidateJobsService.listMailbox({
        kind: filterType,
        offerStatus:
          filterType === "offer" || filterType === "all"
            ? offerStatusFilter === "all"
              ? undefined
              : offerStatusFilter
            : undefined,
        search: jobSearch.trim() ? jobSearch.trim() : undefined,
        page,
        limit: MAILBOX_PAGE_SIZE,
      });

      setData(res);
      setTotal(res.total ?? 0);
    } catch {
      setError("Could not load your messages.");
      setData({ offers: [], rejections: [], total: 0 });
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filterType, offerStatusFilter, jobSearch, page]);

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

  const filtered = items; // Server already applies kind/status/search pagination.

  const selected = selectedKey ? items.find((m) => m.rowKey === selectedKey) : undefined;

  // When selected thread changes, sync counter draft.
  useEffect(() => {
    setOfferRespondError(null);
    if (!selected || selected.kind !== "offer") {
      setCounterDraft("");
      setCounterJobTitleDraft("");
      setCounterSalaryDraft(undefined);
      setCounterLocationDraft(undefined);
      setCounterStartDateDraft(undefined);
      setCounterBenefitsDraft(undefined);
      setCounterError(null);
      return;
    }
    setCounterDraft(selected.status === "counter" ? (selected.counterLetter ?? "") : "");
    setCounterJobTitleDraft(selected.jobTitle ?? "");
    setCounterSalaryDraft(selected.salary);
    setCounterLocationDraft(selected.location);
    setCounterStartDateDraft(selected.startDate);
    setCounterBenefitsDraft(selected.benefits);
    setCounterError(null);
  }, [selected]);

  // Allow Esc to close the counter modal.
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

    // Compare using local calendar day boundaries to avoid rounding/timezone edge-cases.
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfDate = new Date(date);
    startOfDate.setHours(0, 0, 0, 0);

    const dayMs = 1000 * 60 * 60 * 24;
    const diffDays = Math.floor((startOfToday.getTime() - startOfDate.getTime()) / dayMs);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const subjectFor = (m: InboxItem) =>
    m.kind === "offer" ? `Offer — ${m.jobTitle}` : `Update — ${m.jobTitle}`;

  const submitCounter = useCallback(async () => {
    if (selected?.kind !== "offer" || !selected.id) return;
    const trimmedLetter = counterDraft.trim();

    const hasAnyTerms =
      (counterJobTitleDraft ?? "").trim().length > 0 ||
      (counterSalaryDraft ?? "").trim().length > 0 ||
      (counterLocationDraft ?? "").trim().length > 0 ||
      (counterStartDateDraft ?? "").trim().length > 0 ||
      (counterBenefitsDraft ?? "").trim().length > 0;

    const generateCounterLetter = (): string => {
      const title = (counterJobTitleDraft ?? "").trim();
      const salary = (counterSalaryDraft ?? "").trim();
      const loc = (counterLocationDraft ?? "").trim();
      const sd = (counterStartDateDraft ?? "").trim();
      const ben = (counterBenefitsDraft ?? "").trim();

      const lines: string[] = [];
      lines.push(`Dear Hiring Manager${selected.companyName ? ` at ${selected.companyName}` : ""},`);
      lines.push("");
      lines.push("Regarding this offer");
      if (title) lines.push(`Position: ${title}`);
      if (salary) lines.push(`Offered compensation: ${salary}`);
      if (loc) lines.push(`Offered location: ${loc}`);
      if (sd) lines.push(`Start date (offer): ${sd}`);
      if (ben) lines.push(`Benefits (offer): ${ben}`);
      lines.push("");
      lines.push("I would like to propose these updated terms and would appreciate your confirmation.");
      lines.push("");
      lines.push("Sincerely,");
      lines.push(selected.candidateName?.trim() ? selected.candidateName.trim() : "Candidate");
      return lines.join("\n");
    };

    const letter = trimmedLetter || (hasAnyTerms ? generateCounterLetter() : "");
    if (!letter.trim()) return;

    setCounterSubmitting(true);
    setCounterError(null);
    try {
      await candidateJobsService.submitOfferCounter(selected.id, {
        letter,
        salary: counterSalaryDraft ?? undefined,
        location: counterLocationDraft ?? undefined,
        startDate: counterStartDateDraft ?? undefined,
        benefits: counterBenefitsDraft ?? undefined,
        positionTitle: counterJobTitleDraft ?? undefined,
      });
      setCounterModalOpen(false);
      await load();
    } catch {
      setCounterError("Could not send your counter proposal. Please try again.");
    } finally {
      setCounterSubmitting(false);
    }
  }, [
    selected,
    counterDraft,
    counterSalaryDraft,
    counterLocationDraft,
    counterStartDateDraft,
    counterBenefitsDraft,
    counterJobTitleDraft,
    load,
  ]);

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

  return {
    // list view
    loading,
    error,
    filterType,
    setFilterType,
    offerStatusFilter,
    setOfferStatusFilter,
    jobSearch,
    setJobSearch,
    page,
    setPage,
    total,
    MAILBOX_PAGE_SIZE,
    filtered,

    // detail view
    selectedKey,
    setSelectedKey,
    selected,

    // counter modal
    counterDraft,
    setCounterDraft,
    counterJobTitleDraft,
    setCounterJobTitleDraft,
    counterSalaryDraft,
    setCounterSalaryDraft,
    counterLocationDraft,
    setCounterLocationDraft,
    counterStartDateDraft,
    setCounterStartDateDraft,
    counterBenefitsDraft,
    setCounterBenefitsDraft,
    counterSubmitting,
    counterError,
    setCounterError,
    counterModalOpen,
    setCounterModalOpen,

    // offer actions
    offerRespondBusy,
    offerRespondError,
    offerConsentNotice,
    signedPdfBusy,

    // actions
    submitCounter,
    declineOffer,
    startAcceptSigning,
    openSignedOfferInNewTab,

    // helpers
    formatDate,
    formatTime,
    subjectFor,
  };
}

