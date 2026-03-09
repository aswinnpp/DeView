import { useCallback, useEffect, useMemo, useState } from "react";
import {
  interviewerCompletedInterviewsService,
  type CompletedInterviewItem,
} from "../../services/interviewerCompletedInterviews.service";

const ITEMS_PER_PAGE = 10;

export type CompletedSortOrderOption = "asc" | "desc";

export interface CompletedInterviewViewItem {
  id: string;
  candidateName: string;
  jobDescription: { name: string };
  scheduledAt: string;
  status: string;
}

export function useInterviewerCompletedInterviews() {
  const [items, setItems] = useState<CompletedInterviewItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<CompletedSortOrderOption>("desc");

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, total: t } = await interviewerCompletedInterviewsService.list({
        search: searchQuery.trim() || undefined,
        page,
        limit: ITEMS_PER_PAGE,
        sortOrder,
      });
      setItems(data);
      setTotal(t);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to load completed interviews"
      );
      setItems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, page, sortOrder]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const list = useMemo<CompletedInterviewViewItem[]>(() => {
    return items.map((it) => {
      const scheduledAt =
        it.scheduledDate && it.scheduledTime
          ? new Date(`${it.scheduledDate}T${it.scheduledTime}:00`).toISOString()
          : "";
      return {
        id: it.id,
        candidateName: it.candidateName,
        jobDescription: { name: it.jobTitle },
        scheduledAt,
        status: it.status,
      };
    });
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const emptyMessage =
    total === 0
      ? "✅ All evaluations are submitted."
      : "🔍 No interviews found matching your search.";

  return {
    items,
    list,
    total,
    totalPages,
    page,
    setPage,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    emptyMessage,
    fetchItems,
    ITEMS_PER_PAGE,
  };
}
