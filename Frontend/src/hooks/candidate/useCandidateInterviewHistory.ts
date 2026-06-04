import { useCallback, useEffect, useState } from "react";
import {
  candidateInterviewHistoryService,
  type CandidateInterviewHistoryItem,
  type ListInterviewHistoryParams,
} from "../../services/candidateInterviewHistory.service";

export interface UseCandidateInterviewHistoryOptions {
  search?: string;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface UseCandidateInterviewHistoryResult {
  interviews: CandidateInterviewHistoryItem[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  selectedRow: string | null;
  setSelectedRow: (id: string | null) => void;
  expandedRows: Record<string, boolean>;
  toggleExpandRow: (id: string) => void;
  formatDate: (dStr?: string) => string;
  formatTime: (dStr?: string) => string;
}

const DEFAULT_LIMIT = 10;

export function useCandidateInterviewHistory(
  options: UseCandidateInterviewHistoryOptions = {}
): UseCandidateInterviewHistoryResult {
  const { search = "", page = 1, limit = DEFAULT_LIMIT, sortOrder } = options;
  const [interviews, setInterviews] = useState<CandidateInterviewHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: ListInterviewHistoryParams = {
        search: search?.trim() || undefined,
        page,
        limit,
        sortOrder,
      };
      const res = await candidateInterviewHistoryService.list(params);
      setInterviews(res.data);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load interview history");
      setInterviews([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [search, page, limit, sortOrder]);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

 

  const formatDate = (dStr?: string): string => {
    if (!dStr) return "";
    const d = new Date(dStr);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const formatTime = (dStr?: string): string => {
    if (!dStr) return "";
    const d = new Date(dStr);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const toggleExpandRow = (id: string): void => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return {
    interviews,
    total,
    totalPages,
    isLoading,
    error,
    selectedRow,
    setSelectedRow,
    expandedRows,
    toggleExpandRow,
    formatDate,
    formatTime,
  };
}

