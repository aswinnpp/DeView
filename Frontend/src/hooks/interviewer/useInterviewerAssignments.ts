import { useCallback, useEffect, useMemo, useState } from "react";
import {
  interviewerAssignmentsService,
  type InterviewerAssignmentItem,
} from "../../services/interviewerAssignments.service";

export type SortByOption = "date" | "name" | "status";
export type SortOrderOption = "asc" | "desc";

export function useInterviewerAssignments() {
  const [assignments, setAssignments] = useState<InterviewerAssignmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectInterview, setRejectInterview] = useState<InterviewerAssignmentItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortByOption>("date");
  const [sortOrder, setSortOrder] = useState<SortOrderOption>("desc");
  const [isRejecting, setIsRejecting] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const fetchAssignments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await interviewerAssignmentsService.list();
      setAssignments(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load assignments");
      setAssignments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAssignments();
  }, [fetchAssignments]);

  const pendingCount = useMemo(
    () => assignments.filter((a) => a.status === "pending").length,
    [assignments]
  );

  const filtered = useMemo(() => {
    let list = [...assignments];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.candidateName.toLowerCase().includes(q) ||
          a.candidateEmail.toLowerCase().includes(q) ||
          (a.jobTitle || "").toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "date") cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortBy === "name") cmp = a.candidateName.localeCompare(b.candidateName);
      else if (sortBy === "status") cmp = a.status.localeCompare(b.status);
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return list;
  }, [assignments, searchQuery, sortBy, sortOrder]);

  const formatTime = useCallback((time: string) => {
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
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

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setSortBy("date");
    setSortOrder("desc");
  }, []);

  const emptyMessage =
    assignments.length === 0
      ? "No assignments yet."
      : "No assignments found matching your search.";

  const hasActiveFilters = searchQuery !== "" || sortBy !== "date" || sortOrder !== "desc";

  return {
    // data
    assignments,
    filtered,
    pendingCount,
    emptyMessage,
    // loading & error
    isLoading,
    error,
    isAccepting,
    isRejecting,
    // filters
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    resetFilters,
    hasActiveFilters,
    // reject modal
    rejectModalOpen,
    rejectInterview,
    rejectionReason,
    setRejectionReason,
    openRejectModal,
    closeRejectModal,
    submitReject,
    // actions
    fetchAssignments,
    handleAccept,
    formatTime,
    formatDate,
  };
}
