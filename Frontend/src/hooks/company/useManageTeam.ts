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
  // ---- UI state ----
  const [activeTab, setActiveTab] = useState<ActiveTab>("hr");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ---- Data: HR and Interviewer lists ----
  const [hrs, setHrs] = useState<TeamMember[]>([]);
  const [interviewers, setInterviewers] = useState<TeamMember[]>([]);

  // ---- Create modal ----
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // ---- Confirm activate/deactivate ----
  const [memberToToggle, setMemberToToggle] = useState<{
    id: string;
    name: string;
    action: string;
  } | null>(null);

  // ---- Derived: current list and label based on tab ----
  const allMembers = activeTab === "hr" ? hrs : interviewers;
  const tabLabel = activeTab === "hr" ? "HR" : "Interviewer";

  // ---- Fetch HR list (optional search and status filter) ----
  const fetchHRs = useCallback(async (search?: string, status?: string) => {
    try {
      const { data } = await companyTeamService.listHRs(search, status);
      setHrs(toList(data));
    } catch (err) {
      setError(extractApiError(err));
    }
  }, []);

  // ---- Fetch Interviewer list ----
  const fetchInterviewers = useCallback(async (search?: string, status?: string) => {
    try {
      const { data } = await companyTeamService.listInterviewers(search, status);
      setInterviewers(toList(data));
    } catch (err) {
      setError(extractApiError(err));
    }
  }, []);

  // ---- Load both lists on mount ----
  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await Promise.all([fetchHRs(), fetchInterviewers()]);
    setIsLoading(false);
  }, [fetchHRs, fetchInterviewers]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ---- Search: called when user types in search box ----
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

  // ---- Status filter: active / inactive / all ----
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

  // ---- Switch between HR and Interviewer tab ----
  const switchTab = useCallback((tab: ActiveTab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setStatusFilter("all");
    setSuccessMessage("");
    setError(null);
  }, []);

  // ---- Create member modal ----
  const openCreateModal = useCallback(() => setShowCreateModal(true), []);
  const closeCreateModal = useCallback(() => setShowCreateModal(false), []);

  const createMember = useCallback(
    async (data: { fullName: string; email: string }) => {
      setIsCreating(true);
      setError(null);
      try {
        if (activeTab === "hr") {
          await companyTeamService.createHR(data);
          await fetchHRs();
        } else {
          await companyTeamService.createInterviewer(data);
          await fetchInterviewers();
        }
        setSuccessMessage(
          `${tabLabel} account created successfully! A password will be sent to their email.`
        );
        setShowCreateModal(false);
      } catch (err) {
        setError(extractApiError(err));
      } finally {
        setIsCreating(false);
      }
    },
    [activeTab, tabLabel, fetchHRs, fetchInterviewers]
  );

  // ---- Activate / Deactivate (with confirmation) ----
  const requestToggle = useCallback((member: TeamMember) => {
    const action = member.isActive ? "deactivate" : "activate";
    setMemberToToggle({ id: member.id, name: member.fullName, action });
  }, []);

  const cancelToggle = useCallback(() => setMemberToToggle(null), []);

  const confirmToggle = useCallback(async () => {
    if (!memberToToggle) return;
    setError(null);
    try {
      if (activeTab === "hr") {
        await companyTeamService.toggleHRStatus(memberToToggle.id);
        await fetchHRs();
      } else {
        await companyTeamService.toggleInterviewerStatus(memberToToggle.id);
        await fetchInterviewers();
      }
      setMemberToToggle(null);
    } catch (err) {
      setError(extractApiError(err));
      setMemberToToggle(null);
    }
  }, [memberToToggle, activeTab, fetchHRs, fetchInterviewers]);

  return {
    // state
    activeTab,
    hrs,
    interviewers,
    allMembers,
    isLoading,
    error,
    successMessage,
    searchQuery,
    statusFilter,
    tabLabel,
    showCreateModal,
    isCreating,
    memberToToggle,
    // actions
    switchTab,
    handleSearch,
    handleStatusFilter,
    openCreateModal,
    closeCreateModal,
    createMember,
    requestToggle,
    cancelToggle,
    confirmToggle,
  };
}
