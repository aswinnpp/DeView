import { useState, useCallback, useEffect } from "react";
import { companyTeamService } from "../../services/companyTeam.service";
import { extractApiError } from "../../api/axios";
import type { TeamMember } from "../../services/companyTeam.service";

export type ActiveTab = "hr" | "interviewer";

export { type TeamMember };

export function useManageTeam() {
    const [activeTab, setActiveTab] = useState<ActiveTab>("hr");
    const [hrs, setHrs] = useState<TeamMember[]>([]);
    const [interviewers, setInterviewers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // ── Create modal ──────────────────────────────────────────────
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // ── Toggle confirmation ───────────────────────────────────────
    const [memberToToggle, setMemberToToggle] = useState<{ id: string; name: string; action: string } | null>(null);

    // ── Fetch data (with search & status) ─────────────────────────

    const fetchHRs = useCallback(async (search?: string, status?: string) => {
        try {
            const { data } = await companyTeamService.listHRs(search, status);
            setHrs(data?.data ?? []);
        } catch (err) {
            setError(extractApiError(err));
        }
    }, []);

    const fetchInterviewers = useCallback(async (search?: string, status?: string) => {
        try {
            const { data } = await companyTeamService.listInterviewers(search, status);
            setInterviewers(data?.data ?? []);
        } catch (err) {
            setError(extractApiError(err));
        }
    }, []);

    const fetchAll = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        await Promise.all([fetchHRs(), fetchInterviewers()]);
        setIsLoading(false);
    }, [fetchHRs, fetchInterviewers]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    // ── Derived data ──────────────────────────────────────────────

    const allMembers = activeTab === "hr" ? hrs : interviewers;
    const tabLabel = activeTab === "hr" ? "HR" : "Interviewer";

    // ── Search handler (called by SearchInput debounce) ───────────

    const handleSearch = useCallback(async (query: string) => {
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
    }, [activeTab, statusFilter, fetchHRs, fetchInterviewers]);

    // ── Status filter change ──────────────────────────────────────

    const handleStatusFilter = useCallback(async (newStatus: string) => {
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
    }, [activeTab, searchQuery, fetchHRs, fetchInterviewers]);

    // ── Tab switch ────────────────────────────────────────────────

    const switchTab = useCallback((tab: ActiveTab) => {
        setActiveTab(tab);
        setSearchQuery("");
        setStatusFilter("all");
        setSuccessMessage("");
        setError(null);
    }, []);

    // ── Create member ─────────────────────────────────────────────

    const openCreateModal = useCallback(() => setShowCreateModal(true), []);
    const closeCreateModal = useCallback(() => setShowCreateModal(false), []);

    const createMember = useCallback(async (data: { fullName: string; email: string }) => {
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
            setSuccessMessage(`${tabLabel} account created successfully! A password will be sent to their email.`);
            setShowCreateModal(false);
        } catch (err) {
            setError(extractApiError(err));
        } finally {
            setIsCreating(false);
        }
    }, [activeTab, tabLabel, fetchHRs, fetchInterviewers]);

    // ── Toggle status (confirmation flow) ─────────────────────────

    const requestToggle = useCallback((member: TeamMember) => {
        const action = member.isActive ? "deactivate" : "activate";
        setMemberToToggle({ id: member.id, name: member.fullName, action });
    }, []);

    const cancelToggle = useCallback(() => {
        setMemberToToggle(null);
    }, []);

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
