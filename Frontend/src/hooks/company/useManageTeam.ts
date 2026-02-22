/**
 * Hook for managing company team: HR and Interviewer lists, search, filters, create, and activate/deactivate.
 * Use on the "Manage Team" / "Manage HR" page.
 */
import { useState, useCallback, useEffect } from "react";
import { companyTeamService } from "../../services/companyTeam.service";
import { extractApiError } from "../../api/axios";
import type { TeamMember } from "../../services/companyTeam.service";

export type ActiveTab = "hr" | "interviewer";
export type { TeamMember };

// ---------------------------------------------------------------------------
// Helpers: normalize API response to always get an array
// ---------------------------------------------------------------------------
const DEFAULT_LIMIT = 2;

function toList(data: unknown): TeamMember[] {
  if (Array.isArray(data)) return data;
  const wrapped = (data as { data?: TeamMember[] })?.data;
  return Array.isArray(wrapped) ? wrapped : [];
}

export function useManageTeam() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("hr");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(DEFAULT_LIMIT);
  const [total, setTotal] = useState(0);

  const [hrs, setHrs] = useState<TeamMember[]>([]);
  const [interviewers, setInterviewers] = useState<TeamMember[]>([]);

  const allMembers = activeTab === "hr" ? hrs : interviewers;
  const tabLabel = activeTab === "hr" ? "HR" : "Interviewer";
  const totalPages = Math.ceil(total / limit) || 1;

  const fetchHRs = useCallback(async (search?: string, status?: string, p?: number, l?: number) => {
    try {
      const { data } = await companyTeamService.listHRs(search, status, p ?? page, l ?? limit);
      setHrs(toList(data?.data));
      setTotal(data?.total ?? 0);
    } catch (err) {
      setError(extractApiError(err));
    }
  }, [limit, page]);

  const fetchInterviewers = useCallback(async (search?: string, status?: string, p?: number, l?: number) => {
    try {
      const { data } = await companyTeamService.listInterviewers(search, status, p ?? page, l ?? limit);
      setInterviewers(toList(data?.data));
      setTotal(data?.total ?? 0);
    } catch (err) {
      setError(extractApiError(err));
    }
  }, [limit, page]);

  const loadPage = useCallback((p: number, search?: string, status?: string) => {
    const s = search ?? searchQuery;
    const st = status ?? (statusFilter === "all" ? undefined : statusFilter);
    setPage(p);
    setIsLoading(true);
    setError(null);
    if (activeTab === "hr") {
      fetchHRs(s || undefined, st, p, limit).finally(() => setIsLoading(false));
    } else {
      fetchInterviewers(s || undefined, st, p, limit).finally(() => setIsLoading(false));
    }
  }, [activeTab, searchQuery, statusFilter, limit, fetchHRs, fetchInterviewers]);

  const goToPage = useCallback((p: number) => {
    if (p < 1 || p > totalPages) return;
    loadPage(p);
  }, [loadPage, totalPages]);



  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      loadPage(1, query || undefined, statusFilter === "all" ? undefined : statusFilter);
    },
    [loadPage, statusFilter]
  );

  const handleStatusFilter = useCallback(
    (newStatus: string) => {
      setStatusFilter(newStatus);
      loadPage(1, searchQuery || undefined, newStatus === "all" ? undefined : newStatus);
    },
    [loadPage, searchQuery]
  );

  const switchTab = useCallback((tab: ActiveTab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setStatusFilter("all");
    setError(null);
    setPage(1);
  }, []);

  useEffect(() => {
    loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load and tab switch only
  }, [activeTab]);



  const createMember = useCallback(
    async (data: { fullName: string; email: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        if (activeTab === "hr") {
          await companyTeamService.createHR(data);
          loadPage(page);
        } else {
          await companyTeamService.createInterviewer(data);
          loadPage(page);
        }
      } catch (err) {
        setError(extractApiError(err));
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab, loadPage, page]
  );

  const confirmToggle = useCallback(async (memberToToggle: TeamMember | null, setMemberToToggle: (value: TeamMember | null) => void) => {
    if (!memberToToggle) return;
    setError(null);
    try {
      if (activeTab === "hr") {
        await companyTeamService.toggleHRStatus(memberToToggle.id);
        setMemberToToggle(null);
        loadPage(page);
      } else {
        await companyTeamService.toggleInterviewerStatus(memberToToggle.id);
        setMemberToToggle(null);
        loadPage(page);
      }
    } catch (err) {
      setError(extractApiError(err));
    }
  }, [activeTab, loadPage, page]);

  return {
    activeTab,
    allMembers,
    isLoading,
    error,
    searchQuery,
    statusFilter,
    tabLabel,
    switchTab,
    handleSearch,
    handleStatusFilter,
    createMember,
    confirmToggle,
    page,
    limit,
    total,
    totalPages,
    goToPage,
  };
}
