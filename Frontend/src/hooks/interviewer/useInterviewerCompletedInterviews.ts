import { useCallback, useEffect, useMemo, useState } from "react";
import {
  interviewerCompletedInterviewsService,
  type CompletedInterviewItem,
} from "../../services/interviewerCompletedInterviews.service";

export type CompletedSortByOption = "date" | "name" | "role";
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<CompletedSortByOption>("date");
  const [sortOrder, setSortOrder] = useState<CompletedSortOrderOption>("desc");

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await interviewerCompletedInterviewsService.list();
      setItems(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to load completed interviews"
      );
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const list = useMemo<CompletedInterviewViewItem[]>(() => {
    let result = items.map((it) => {
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

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (row) =>
          row.candidateName.toLowerCase().includes(q) ||
          row.jobDescription.name.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "date") {
        const da = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
        const db = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
        cmp = da - db;
      } else if (sortBy === "name") {
        cmp = a.candidateName.localeCompare(b.candidateName);
      } else if (sortBy === "role") {
        cmp = a.jobDescription.name.localeCompare(b.jobDescription.name);
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return result;
  }, [items, searchQuery, sortBy, sortOrder]);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setSortBy("date");
    setSortOrder("desc");
  }, []);

  const emptyMessage =
    items.length === 0
      ? "✅ All evaluations are submitted."
      : "🔍 No interviews found matching your search.";

  const hasActiveFilters =
    searchQuery !== "" || sortBy !== "date" || sortOrder !== "desc";

  return {
    items,
    list,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    resetFilters,
    emptyMessage,
    hasActiveFilters,
    fetchItems,
  };
}

