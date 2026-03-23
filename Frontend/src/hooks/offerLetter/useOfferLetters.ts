import { useCallback, useEffect, useMemo, useState } from "react";
import { applicationsService } from "../../services/applications.service";
import type { JobListItem } from "../../services/applications.service";
import { extractApiError } from "../../api/axios";



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

const OFFER_LETTERS_PAGE_SIZE = 10;

export function useOfferLetters() {
  const [rows, setRows] = useState<OfferLetterRow[]>([]);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [jobSearch, setJobSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<OfferLetterRow | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const [counterResponding, setCounterResponding] = useState<string | null>(null);
  const [signedPdfBusy, setSignedPdfBusy] = useState(false);
  const [signedPdfError, setSignedPdfError] = useState<string | null>(null);

  const loadJobs = useCallback(async (): Promise<void> => {
    try {
      const jobsResult = await applicationsService.listJobs({ limit: 500 });
      setJobs(jobsResult.data ?? []);
    } catch {
      // Non-blocking: the table can still render using raw jobId values.
      setJobs([]);
    }
  }, []);

  const loadOffers = useCallback(async (): Promise<OfferLetterRow[]> => {
    setLoading(true);
    setError(null);

    const jobId = selectedJobId === "all" ? undefined : selectedJobId;
    const status = selectedStatus === "all" ? undefined : selectedStatus;
    const search = jobSearch.trim() ? jobSearch.trim() : undefined;

    try {
      const offerRes = await applicationsService.listOfferMails({
        jobId,
        status: status as OfferLetterRow["status"] | undefined,
        search,
        page,
        limit: OFFER_LETTERS_PAGE_SIZE,
      });

      const normalized = offerRes.data.map((r) => ({
        ...r,
        status:
          r.status === "accepted" || r.status === "declined" || r.status === "pending" || r.status === "counter"
            ? r.status
            : "pending",
        signedOfferAvailable: Boolean(r.signedOfferAvailable),
      }));

      setRows(normalized);
      setTotal(offerRes.total ?? 0);
      return normalized;
    } catch {
      setError("Could not load offer letters.");
      setRows([]);
      setTotal(0);
      return [];
    } finally {
      setLoading(false);
    }
  }, [jobSearch, page, selectedJobId, selectedStatus]);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    void loadOffers();
  }, [loadOffers]);

  useEffect(() => {
    setSignedPdfError(null);
  }, [selectedOffer]);

  const refreshOffers = useCallback(async () => {
    const refreshed = await loadOffers();
    if (selectedOffer?.id) {
      const updated = refreshed.find((r) => r.id === selectedOffer.id);
      setSelectedOffer(updated ?? null);
    }
  }, [loadOffers, selectedOffer?.id]);

  const openEmployerSignedPdfInNewTab = useCallback(async () => {
    if (!selectedOffer?.id) return;
    setSignedPdfBusy(true);
    setSignedPdfError(null);
    try {
      const blob = await applicationsService.fetchOfferSignedPdf(selectedOffer.id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      setSignedPdfError(extractApiError(e));
    } finally {
      setSignedPdfBusy(false);
    }
  }, [selectedOffer?.id]);

  const respondToCounter = useCallback(
    async (action: "accept" | "reject") => {
      if (!selectedOffer?.id) return;
      if (!window.confirm) {
        // should never happen, but keep function safe in unusual environments
      }

      if (action === "reject") {
        const ok = window.confirm(
          "Are you sure you want to reject this counter proposal? The candidate will be notified."
        );
        if (!ok) return;
      }

      setCounterResponding(action);
      try {
        await applicationsService.respondToCounterLetter(selectedOffer.id, action);
        const refreshed = await loadOffers();
        const updated = refreshed.find((r) => r.id === selectedOffer.id);
        setSelectedOffer(updated ?? null);
      } finally {
        setCounterResponding(null);
      }
    },
    [loadOffers, selectedOffer?.id]
  );

  const jobTitleMap = useMemo(() => {
    const m = new Map<string, string>();
    jobs.forEach((j) => m.set(j.id, j.title));
    return m;
  }, [jobs]);

  const visibleRows = rows;
  const totalPages = Math.max(1, Math.ceil(total / OFFER_LETTERS_PAGE_SIZE));
  const paginationLeftContent =
    total > 0
      ? `Showing ${(page - 1) * OFFER_LETTERS_PAGE_SIZE + 1}–${Math.min(page * OFFER_LETTERS_PAGE_SIZE, total)} of ${total}`
      : undefined;

  return {
    // list
    rows: visibleRows,
    jobs,
    total,
    page,
    setPage,
    jobSearch,
    setJobSearch,
    loading,
    error,
    selectedOffer,
    setSelectedOffer,
    selectedJobId,
    setSelectedJobId,
    selectedStatus,
    setSelectedStatus,

    // pagination
    OFFER_LETTERS_PAGE_SIZE,
    totalPages,
    paginationLeftContent,

    // helpers
    jobTitleMap,

    // detail actions
    counterResponding,
    respondToCounter,
    signedPdfBusy,
    signedPdfError,
    openEmployerSignedPdfInNewTab,
    refreshOffers,
  };
}

