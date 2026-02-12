import { useState, useMemo, useCallback, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../useApi';
import { rejectCompanyRequestBodySchema, type RejectCompanyRequestBody } from '@shared/contracts/companyApproval/admin';

// ─── Types ───────────────────────────────────────────────────────────────────

type DocumentUpload = {
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  verified: boolean;
};

type CompanyApproval = {
  id: string;
  userId: string;
  companyName: string;
  address: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  taxId: string;
  website?: string;
  numberOfEmployees: string;
  documents?: Record<string, DocumentUpload>;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Document config (used in the UI) ─────────────────────────────────────────

const DOCUMENT_CONFIG = [
  { key: 'certificateOfIncorporation', label: 'Certificate of Incorporation', shortLabel: 'Incorporation', description: 'Legal document proving business registration', required: true },
  { key: 'gstCertificate', label: 'GST Certificate', shortLabel: 'GST', description: 'Goods and Services Tax registration', required: true },
  { key: 'panCard', label: 'Company PAN Card', shortLabel: 'PAN Card', description: 'Permanent Account Number card', required: true },
  { key: 'addressProof', label: 'Address Proof', shortLabel: 'Address', description: 'Utility bill or lease agreement', required: true },
  { key: 'authorizedSignatoryId', label: 'Authorized Signatory ID', shortLabel: 'Signatory ID', description: 'ID proof of authorized person', required: true },
  { key: 'bankDocument', label: 'Bank Document', shortLabel: 'Bank', description: 'Cancelled cheque or bank statement', required: false },
] as const;

// ─── Helper: check if a document exists ───────────────────────────────────────

function hasDocument(docs: Record<string, DocumentUpload> | undefined, key: string): boolean {
  return !!(docs && docs[key]);
}

function getDocument(docs: Record<string, DocumentUpload> | undefined, key: string): DocumentUpload | undefined {
  return docs?.[key];
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAdminCompanyRequests() {
  // --- State ---
  const [pendingCompanies, setPendingCompanies] = useState<CompanyApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedCompany, setSelectedCompany] = useState<CompanyApproval | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [documentVerification, setDocumentVerification] = useState<Record<string, boolean>>({});

  const rejectForm = useForm<RejectCompanyRequestBody>({
    resolver: zodResolver(rejectCompanyRequestBodySchema),
    defaultValues: { reason: '' },
    mode: 'onSubmit',
  });

  // --- Fetch pending companies (runs on mount) ---

  const fetchPendingCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<CompanyApproval[]>('/admin/company-requests/pending');
      setPendingCompanies(response.data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch company requests';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingCompanies();
  }, [fetchPendingCompanies]);

  // --- Search / Filter ---

  const filteredCompanies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return pendingCompanies;

    return pendingCompanies.filter((company) => {
      const matchesName = company.companyName.toLowerCase().includes(query);
      const matchesEmail = company.contactEmail.toLowerCase().includes(query);
      const matchesContact = (company.contactPerson ?? '').toLowerCase().includes(query);
      return matchesName || matchesEmail || matchesContact;
    });
  }, [pendingCompanies, searchQuery]);

  // --- Company selection & review modal ---

  const selectCompany = useCallback((company: CompanyApproval) => {
    setSelectedCompany(company);
    // Reset verification checkboxes based on what's uploaded
    const verification: Record<string, boolean> = {};
    if (company.documents) {
      for (const doc of DOCUMENT_CONFIG) {
        const uploaded = getDocument(company.documents, doc.key);
        if (uploaded) {
          verification[doc.key] = uploaded.verified ?? false;
        }
      }
    }
    setDocumentVerification(verification);
  }, []);

  const clearSelectedCompany = useCallback(() => {
    setSelectedCompany(null);
    setDocumentVerification({});
  }, []);

  // --- Reject modal ---

  const openRejectModal = useCallback(() => setShowRejectModal(true), []);
  const closeRejectModal = useCallback(() => {
    setShowRejectModal(false);
    rejectForm.reset({ reason: '' });
  }, [rejectForm]);

  // --- Approve action ---

  const handleApprove = useCallback(async (companyId: string) => {
    try {
      await api.post(`/admin/company-requests/${companyId}/approve`);
      setPendingCompanies((prev) => prev.filter((c) => c.id !== companyId));
      setSelectedCompany(null);
      setDocumentVerification({});
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve company');
    }
  }, []);

  // --- Reject action ---

  const onRejectSubmit: SubmitHandler<RejectCompanyRequestBody> = useCallback(
    async (values) => {
      if (!selectedCompany) return;

      try {
        await api.post(`/admin/company-requests/${selectedCompany.id}/reject`, { reason: values.reason });
        const companyId = selectedCompany.id;
        setPendingCompanies((prev) => prev.filter((c) => c.id !== companyId));
        closeRejectModal();
        setSelectedCompany(null);
        setDocumentVerification({});
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to reject company');
      }
    },
    [selectedCompany, closeRejectModal]
  );

  // --- Document verification toggle ---

  const toggleDocVerification = useCallback((docKey: string) => {
    setDocumentVerification((prev) => ({
      ...prev,
      [docKey]: !prev[docKey],
    }));
  }, []);

  // --- Document helpers (for the UI) ---

  const getDocumentCount = useCallback((docs?: Record<string, DocumentUpload>) => {
    if (!docs) return { uploaded: 0, total: DOCUMENT_CONFIG.length };
    const uploaded = DOCUMENT_CONFIG.filter((d) => hasDocument(docs, d.key)).length;
    return { uploaded, total: DOCUMENT_CONFIG.length };
  }, []);

  const getRequiredDocsUploaded = useCallback((docs?: Record<string, DocumentUpload>) => {
    if (!docs) return false;
    const requiredDocs = DOCUMENT_CONFIG.filter((d) => d.required);
    return requiredDocs.every((d) => hasDocument(docs, d.key));
  }, []);

  const getVerifiedCount = useCallback(() => {
    return Object.values(documentVerification).filter(Boolean).length;
  }, [documentVerification]);

  const getUploadedDocsCount = useCallback(() => {
    const docs = selectedCompany?.documents;
    if (!docs) return 0;
    return DOCUMENT_CONFIG.filter((d) => hasDocument(docs, d.key)).length;
  }, [selectedCompany]);

  const areAllDocsVerified = useCallback(() => {
    const docs = selectedCompany?.documents;
    if (!docs) return false;
    const uploaded = DOCUMENT_CONFIG.filter((d) => hasDocument(docs, d.key));
    return uploaded.every((d) => documentVerification[d.key]);
  }, [selectedCompany, documentVerification]);

  const getUploadedDoc = useCallback(
    (docKey: string) => getDocument(selectedCompany?.documents, docKey),
    [selectedCompany]
  );

  // --- Return (everything the page needs) ---

  return {
    // Data
    pendingCompanies,
    filteredCompanies,
    isLoading,
    error,
    fetchPendingCompanies,
    // Search
    searchQuery,
    setSearchQuery,
    // Selected company & review modal
    selectedCompany,
    clearSelectedCompany,
    selectCompany,
    // Reject modal
    showRejectModal,
    rejectForm,
    onRejectSubmit,
    openRejectModal,
    closeRejectModal,
    // Actions
    handleApprove,
    // Document verification
    documentVerification,
    documentConfig: DOCUMENT_CONFIG,
    toggleDocVerification,
    // Document helpers
    getDocumentCount,
    getRequiredDocsUploaded,
    getVerifiedCount,
    getUploadedDocsCount,
    areAllDocsVerified,
    getUploadedDoc,
  };
}

export default useAdminCompanyRequests;
