import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  interviewerAssignmentsService,
  type InterviewerAssignmentItem,
} from "../../services/interviewerAssignments.service";
import { APP_ROUTES } from "../../constants/routes";

const ITEMS_PER_PAGE = 10;

export type DashboardSortOrderOption = "asc" | "desc";

export function useInterviewerDashboard() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<InterviewerAssignmentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<DashboardSortOrderOption>("asc");

  const fetchAssignments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, total: t } = await interviewerAssignmentsService.list({
        search: searchQuery.trim() || undefined,
        page,
        limit: ITEMS_PER_PAGE,
        sortOrder,
        acceptedOnly: true,
      });
      setAssignments(data);
      setTotal(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load interviews");
      setAssignments([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, page, sortOrder]);

  useEffect(() => {
    void fetchAssignments();
  }, [fetchAssignments]);

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

  const handleJoinRoom = useCallback(
    (interviewId: string) => {
      navigate(APP_ROUTES.INTERVIEW_ROOM(interviewId));
    },
    [navigate]
  );

  const emptyMessage =
    total === 0
      ? "No accepted interviews yet. Accept interviews from the Assignments page to see them here."
      : "No interviews found matching your search.";

  return {
    assignments,
    acceptedOnly: assignments,
    filtered: assignments,
    total,
    totalPages,
    page,
    setPage,
    emptyMessage,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    formatTime,
    formatDate,
    handleJoinRoom,
    fetchAssignments,
    ITEMS_PER_PAGE,
  };
}
