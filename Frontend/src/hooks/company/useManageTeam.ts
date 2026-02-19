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

  const [hrs, setHrs] = useState<TeamMember[]>([]);
  const [interviewers, setInterviewers] = useState<TeamMember[]>([]);


  const allMembers = activeTab === "hr" ? hrs : interviewers;
  const tabLabel = activeTab === "hr" ? "HR" : "Interviewer";

  const fetchHRs = useCallback(async (search?: string, status?: string) => {
    try {
      const { data } = await companyTeamService.listHRs(search, status);
      setHrs(toList(data));
    } catch (err) {
      setError(extractApiError(err));
    }
  }, []);

  const fetchInterviewers = useCallback(async (search?: string, status?: string) => {
    try {
      const { data } = await companyTeamService.listInterviewers(search, status);
      setInterviewers(toList(data));
    } catch (err) {
      setError(extractApiError(err));
    }
  }, []);



  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      setIsLoading(true);
      setError(null);
      const status = statusFilter === "all" ? undefined : statusFilter;
      try {
        if (activeTab === "hr") {
          await fetchHRs(query || undefined, status);
        } else {
          await fetchInterviewers(query || undefined, status);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab, statusFilter, fetchHRs, fetchInterviewers]
  );

  const handleStatusFilter = useCallback(
    async (newStatus: string) => {
      setStatusFilter(newStatus);
      setIsLoading(true);
      setError(null);
      const status = newStatus === "all" ? undefined : newStatus;
      try {
        if (activeTab === "hr") {
          await fetchHRs(searchQuery || undefined, status);
        } else {
          await fetchInterviewers(searchQuery || undefined, status);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab, searchQuery, fetchHRs, fetchInterviewers]
  );

  const switchTab = useCallback((tab: ActiveTab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setStatusFilter("all");
    setError(null);
  }, []);



  const createMember = useCallback(
    async (data: { fullName: string; email: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        if (activeTab === "hr") {
          await companyTeamService.createHR(data);
          await fetchHRs();
        } else {
          await companyTeamService.createInterviewer(data);
          await fetchInterviewers();
        }

      } catch (err) {
        setError(extractApiError(err));
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab, tabLabel, fetchHRs, fetchInterviewers]
  );


  const confirmToggle = useCallback(async (memberToToggle: any, setMemberToToggle: any) => {
    if (!memberToToggle) return;
    setError(null);
    try {
      if (activeTab === "hr") {
        console.log("ss", memberToToggle);

        await companyTeamService.toggleHRStatus(memberToToggle.id);

        setMemberToToggle(null)
        await fetchHRs();

      } else {
        await companyTeamService.toggleInterviewerStatus(memberToToggle.id);

        setMemberToToggle(null)


        await fetchInterviewers();

      }

    } catch (err) {
      setError(extractApiError(err));

    }
  }, [, activeTab, fetchHRs, fetchInterviewers]);

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
  };
}
