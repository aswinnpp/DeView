import { useCallback, useEffect, useMemo, useState } from "react";
import {
  interviewerAssignmentsService,
  type InterviewerAssignmentItem,
} from "../../services/interviewerAssignments.service";

const ITEMS_PER_PAGE = 10;

export type SortOrderOption = "asc" | "desc";

export function useInterviewerAssignments() {
  const [assignments, setAssignments] = useState<InterviewerAssignmentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectInterview, setRejectInterview] = useState<InterviewerAssignmentItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<SortOrderOption>("desc");
  const [isRejecting, setIsRejecting] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const fetchAssignments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, total: t } = await interviewerAssignmentsService.list({
        search: searchQuery.trim() || undefined,
        page,
        limit: ITEMS_PER_PAGE,
        sortOrder,
      });
      setAssignments(data);
      setTotal(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load assignments");
      setAssignments([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, page, sortOrder]);

  useEffect(() => {
    void fetchAssignments();
  }, [fetchAssignments]);

  const pendingCount = useMemo(
    () => assignments.filter((a) => a.status === "pending").length,
    [assignments]
  );

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const formatTime = useCallback((time: string) => {
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:${m ?? "00"} ${ampm}`;
  }, []);

  const formatDate = useCallback((dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  const handleAccept = useCallback(
    async (id: string) => {
      setIsAccepting(true);
      try {
        await interviewerAssignmentsService.accept(id);
        await fetchAssignments();
      } catch (e) {
        alert(e instanceof Error ? e.message : "Failed to accept assignment");
      } finally {
        setIsAccepting(false);
      }
    },
    [fetchAssignments]
  );

  const openRejectModal = useCallback((item: InterviewerAssignmentItem) => {
    setRejectInterview(item);
    setRejectionReason("");
    setRejectModalOpen(true);
  }, []);

  const closeRejectModal = useCallback(() => {
    setRejectModalOpen(false);
    setRejectInterview(null);
    setIsRejecting(false);
  }, []);

  const submitReject = useCallback(async () => {
    if (!rejectInterview || !rejectionReason.trim()) return;
    setIsRejecting(true);
    try {
      await interviewerAssignmentsService.reject(rejectInterview.id, rejectionReason.trim());
      await fetchAssignments();
      closeRejectModal();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to reject assignment");
    } finally {
      setIsRejecting(false);
    }
  }, [rejectInterview, rejectionReason, fetchAssignments, closeRejectModal]);

  const emptyMessage =
    total === 0
      ? "No assignments yet."
      : "No assignments found matching your search.";

  return {
    assignments,
    filtered: assignments,
    total,
    totalPages,
    page,
    setPage,
    pendingCount,
    emptyMessage,
    isLoading,
    error,
    isAccepting,
    isRejecting,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    formatTime,
    formatDate,
    rejectModalOpen,
    rejectInterview,
    rejectionReason,
    setRejectionReason,
    openRejectModal,
    closeRejectModal,
    submitReject,
    fetchAssignments,
    handleAccept,
    ITEMS_PER_PAGE,
  };
}
