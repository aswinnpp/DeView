import { useState, useCallback, useEffect } from "react";
import { adminCompanyManagementService } from "../../services/adminCompanyManagement.service";
import { extractApiError } from "../../api/axios";
import type { CompanyApproval, DocumentUpload } from "../../services/adminCompanyManagement.service";

// Re-export types so pages/components can import from this hook
export type { CompanyApproval, DocumentUpload };

// ─── Constants ──────────────────────────────────────────────────

export const DOCUMENT_CONFIG = [
    { key: "certificateOfIncorporation", label: "Certificate of Incorporation", shortLabel: "Incorporation", description: "Legal document proving business registration", required: true },
    { key: "gstCertificate", label: "GST Certificate", shortLabel: "GST", description: "Goods and Services Tax registration", required: true },
    { key: "panCard", label: "Company PAN Card", shortLabel: "PAN Card", description: "Permanent Account Number card", required: true },
    { key: "addressProof", label: "Address Proof", shortLabel: "Address", description: "Utility bill or lease agreement", required: true },
    { key: "authorizedSignatoryId", label: "Authorized Signatory ID", shortLabel: "Signatory ID", description: "ID proof of authorized person", required: true },
    { key: "bankDocument", label: "Bank Document", shortLabel: "Bank", description: "Cancelled cheque or bank statement", required: false },
] as const;

// ─── Hook ───────────────────────────────────────────────────────

export function useAdminCompanyManagement() {
    const [companies, setCompanies] = useState<CompanyApproval[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCompany, setSelectedCompany] = useState<CompanyApproval | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);

    // ── Toggle confirmation state ─────────────────────────────────
    const [toggleTarget, setToggleTarget] = useState<CompanyApproval | null>(null);
    const [isToggling, setIsToggling] = useState(false);

    // ── Fetch (with optional search) ──────────────────────────────

    const fetchCompanies = useCallback(async (search?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await adminCompanyManagementService.getApproved(search);
            setCompanies(data?.approvals ?? []);
        } catch (err) {
            setError(extractApiError(err));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    // ── Search handler (called by SearchInput debounce) ───────────

    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);
        await fetchCompanies(query || undefined);
    }, [fetchCompanies]);

    // ── Select / deselect ─────────────────────────────────────────

    const selectCompany = useCallback((company: CompanyApproval) => {
        setSelectedCompany(company);
    }, []);

    const clearSelectedCompany = useCallback(() => {
        setSelectedCompany(null);
    }, []);

    // ── Toggle active / inactive (confirmation flow) ──────────────

    const requestToggle = useCallback((company: CompanyApproval) => {
        setToggleTarget(company);
    }, []);

    const cancelToggle = useCallback(() => {
        setToggleTarget(null);
    }, []);

    const confirmToggle = useCallback(async () => {
        if (!toggleTarget) return;
        setIsToggling(true);
        try {
            await adminCompanyManagementService.toggleActive(toggleTarget.id);
            setToggleTarget(null);
            fetchCompanies();
        } catch (err) {
            setError(extractApiError(err));
            setToggleTarget(null);
        } finally {
            setIsToggling(false);
        }
    }, [toggleTarget, fetchCompanies]);

    // ── Reject flow ───────────────────────────────────────────────

    const openRejectModal = useCallback(() => {
        setShowRejectModal(true);
    }, []);

    const closeRejectModal = useCallback(() => {
        setShowRejectModal(false);
    }, []);

    const handleRejectSuccess = useCallback(() => {
        setShowRejectModal(false);
        setSelectedCompany(null);
        fetchCompanies();
    }, [fetchCompanies]);

    return {
        // state
        companies,
        isLoading,
        error,
        searchQuery,
        selectedCompany,
        showRejectModal,
        toggleTarget,
        isToggling,

        // actions
        handleSearch,
        selectCompany,
        clearSelectedCompany,
        fetchCompanies,
        requestToggle,
        confirmToggle,
        cancelToggle,
        openRejectModal,
        closeRejectModal,
        handleRejectSuccess,
    };
}
