import { useState, useCallback, useEffect, useTransition } from "react";
import { adminApprovalService } from "../../services/adminApproval.service";
import { extractApiError } from "../../api/axios";
import type { CompanyApproval, DocumentUpload } from "../../services/adminApproval.service";

export const DOCUMENT_CONFIG = [
  { key: "certificateOfIncorporation", label: "Certificate of Incorporation", shortLabel: "Incorporation", description: "Legal document proving business registration", required: true },
  { key: "gstCertificate", label: "GST Certificate", shortLabel: "GST", description: "Goods and Services Tax registration", required: true },
  { key: "panCard", label: "Company PAN Card", shortLabel: "PAN Card", description: "Permanent Account Number card", required: true },
  { key: "addressProof", label: "Address Proof", shortLabel: "Address", description: "Utility bill or lease agreement", required: true },
  { key: "authorizedSignatoryId", label: "Authorized Signatory ID", shortLabel: "Signatory ID", description: "ID proof of authorized person", required: true },
  { key: "bankDocument", label: "Bank Document", shortLabel: "Bank", description: "Cancelled cheque or bank statement", required: false },
] as const;

export function useAdminCompanyRequests() {
  const [pendingCompanies, setPendingCompanies] = useState<CompanyApproval[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<CompanyApproval | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchPendingCompanies = useCallback(async (search?: string) => {
    setIsFetching(true);
    setError(null);

    try {
      const { data } = await adminApprovalService.getPending(search);
      setPendingCompanies(data ?? []);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setIsFetching(false);
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingCompanies();
  }, [fetchPendingCompanies]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      startTransition(() => {
        fetchPendingCompanies(query || undefined);
      });
    },
    [fetchPendingCompanies]
  );

  const selectCompany = useCallback((c: CompanyApproval) => setSelectedCompany(c), []);
  const clearSelectedCompany = useCallback(() => setSelectedCompany(null), []);

  const openRejectModal = useCallback(() => setShowRejectModal(true), []);
  const closeRejectModal = useCallback(() => setShowRejectModal(false), []);

  const handleApprove = useCallback(async (id: string) => {
    await adminApprovalService.approve(id);
    fetchPendingCompanies();
    setSelectedCompany(null);
  }, [fetchPendingCompanies]);

  const handleRejectSuccess = useCallback(() => {
    fetchPendingCompanies();
    setShowRejectModal(false);
    setSelectedCompany(null);
  }, [fetchPendingCompanies]);

  const getDocumentCount = useCallback(
    (docs?: Record<string, DocumentUpload>) => ({
      uploaded: DOCUMENT_CONFIG.filter((d) => !!docs?.[d.key]).length,
      total: DOCUMENT_CONFIG.length,
    }),
    []
  );

  const getRequiredDocsUploaded = useCallback(
    (docs?: Record<string, DocumentUpload>) =>
      DOCUMENT_CONFIG.filter((d) => d.required).every((d) => !!docs?.[d.key]),
    []
  );

  return {
    pendingCompanies,
    initialLoading,
    isFetching,
    isPending,
    error,
    fetchPendingCompanies,
    searchQuery,
    handleSearch,
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
