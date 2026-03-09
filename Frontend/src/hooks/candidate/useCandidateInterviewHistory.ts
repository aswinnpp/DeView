import { useEffect, useState } from "react";
import { candidateInterviewHistoryService, type CandidateInterviewHistoryItem } from "../../services/candidateInterviewHistory.service";

export interface UseCandidateInterviewHistoryResult {
  interviews: CandidateInterviewHistoryItem[];
  isLoading: boolean;
  error: string | null;
  selectedRow: string | null;
  setSelectedRow: (id: string | null) => void;
  expandedRows: Record<string, boolean>;
  toggleExpandRow: (id: string) => void;
  formatDate: (dStr?: string) => string;
  formatTime: (dStr?: string) => string;
}

export function useCandidateInterviewHistory(): UseCandidateInterviewHistoryResult {
  const [interviews, setInterviews] = useState<CandidateInterviewHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await candidateInterviewHistoryService.list();
        
        
        
        
        setInterviews(res.data as unknown as CandidateInterviewHistoryItem[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load interview history");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchHistory();
  }, []);

 

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

