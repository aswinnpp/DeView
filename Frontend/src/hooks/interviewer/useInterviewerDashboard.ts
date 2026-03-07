import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  interviewerAssignmentsService,
  type InterviewerAssignmentItem,
} from "../../services/interviewerAssignments.service";
import { APP_ROUTES } from "../../constants/routes";

export type DashboardSortByOption = "date" | "name" | "role";
export type DashboardSortOrderOption = "asc" | "desc";

export function useInterviewerDashboard() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<InterviewerAssignmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<DashboardSortByOption>("date");
  const [sortOrder, setSortOrder] = useState<DashboardSortOrderOption>("asc");

  const fetchAssignments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await interviewerAssignmentsService.list();
      setAssignments(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load interviews");
      setAssignments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAssignments();
  }, [fetchAssignments]);

  const acceptedOnly = useMemo(
    () => assignments.filter((a) => a.status === "accepted"),
    [assignments]
  );

  const filtered = useMemo(() => {
    let list = [...acceptedOnly];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.candidateName.toLowerCase().includes(q) ||
          (a.candidateEmail || "").toLowerCase().includes(q) ||
          (a.jobTitle || "").toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "date") cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortBy === "name") cmp = a.candidateName.localeCompare(b.candidateName);
      else if (sortBy === "role") cmp = (a.jobTitle || "").localeCompare(b.jobTitle || "");
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return list;
  }, [acceptedOnly, searchQuery, sortBy, sortOrder]);

  const formatTime = useCallback((time: string) => {
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:${m || "00"} ${ampm}`;
  }, []);

  const formatDate = useCallback((dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  const handleJoinRoom = useCallback(
    (interviewId: string) => {
      navigate(APP_ROUTES.INTERVIEW_ROOM(interviewId));
    },
    [navigate]
  );

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setSortBy("date");
    setSortOrder("asc");
  }, []);

  const emptyMessage =
    acceptedOnly.length === 0
      ? "No accepted interviews yet. Accept interviews from the Assignments page to see them here."
      : "No interviews found matching your search.";

  const hasActiveFilters = searchQuery !== "" || sortBy !== "date" || sortOrder !== "asc";

  return {
    assignments,
    acceptedOnly,
    filtered,
    emptyMessage,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    resetFilters,
    hasActiveFilters,
    formatTime,
    formatDate,
    handleJoinRoom,
    fetchAssignments,
  };
}
