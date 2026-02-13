import { useState, useMemo, useCallback, useEffect } from "react";
import { adminApprovalService } from "../../services/adminApproval.service";
import { extractApiError } from "../../api/axios";
import type { CompanyApproval, DocumentUpload } from "../../services/adminApproval.service";

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

export function useAdminCompanyRequests() {
  const [pendingCompanies, setPendingCompanies] = useState<CompanyApproval[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<CompanyApproval | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchPendingCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await adminApprovalService.getPending();
      setPendingCompanies(data ?? []);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingCompanies();
  }, [fetchPendingCompanies]);

  const filteredCompanies = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return pendingCompanies;
    return pendingCompanies.filter(
      (c) =>
        c.companyName.toLowerCase().includes(q) ||
        c.contactEmail.toLowerCase().includes(q) ||
        (c.contactPerson ?? "").toLowerCase().includes(q)
    );
  }, [pendingCompanies, searchQuery]);

  const selectCompany = useCallback((company: CompanyApproval) => {
    setSelectedCompany(company);
  }, []);

  const clearSelectedCompany = useCallback(() => {
    setSelectedCompany(null);
    setShowRejectModal(false);
  }, []);

  const openRejectModal = useCallback(() => setShowRejectModal(true), []);
  const closeRejectModal = useCallback(() => setShowRejectModal(false), []);

  const handleApprove = useCallback(async (id: string) => {
    try {
      await adminApprovalService.approve(id);
      fetchPendingCompanies();
      setSelectedCompany(null);
    } catch (err) {
      setError(extractApiError(err));
    }
  }, [fetchPendingCompanies]);

  const handleRejectSuccess = useCallback(() => {
    fetchPendingCompanies();
    setShowRejectModal(false);
    setSelectedCompany(null);
  }, [fetchPendingCompanies]);

  const getDocumentCount = useCallback((docs?: Record<string, DocumentUpload>) => ({
    uploaded: DOCUMENT_CONFIG.filter((d) => !!docs?.[d.key]).length,
    total: DOCUMENT_CONFIG.length,
  }), []);

  const getRequiredDocsUploaded = useCallback((docs?: Record<string, DocumentUpload>) =>
    DOCUMENT_CONFIG.filter((d) => d.required).every((d) => !!docs?.[d.key]),
    []);

  return {
    pendingCompanies,
    filteredCompanies,
    isLoading,
    error,
    fetchPendingCompanies,
    searchQuery,
    setSearchQuery,
    selectedCompany,
    selectCompany,
    clearSelectedCompany,
    showRejectModal,
    openRejectModal,
    closeRejectModal,
    handleApprove,
    handleRejectSuccess,
    getDocumentCount,
    getRequiredDocsUploaded,
  };
}
