import { useState, useMemo, useCallback } from 'react';

// Document config for admin review
const DOCUMENT_CONFIG = [
  { key: 'certificateOfIncorporation', label: 'Certificate of Incorporation', shortLabel: 'Incorporation', description: 'Legal document proving business registration', required: true },
  { key: 'gstCertificate', label: 'GST Certificate', shortLabel: 'GST', description: 'Goods and Services Tax registration', required: true },
  { key: 'panCard', label: 'Company PAN Card', shortLabel: 'PAN Card', description: 'Permanent Account Number card', required: true },
  { key: 'addressProof', label: 'Address Proof', shortLabel: 'Address', description: 'Utility bill or lease agreement', required: true },
  { key: 'authorizedSignatoryId', label: 'Authorized Signatory ID', shortLabel: 'Signatory ID', description: 'ID proof of authorized person', required: true },
  { key: 'bankDocument', label: 'Bank Document', shortLabel: 'Bank', description: 'Cancelled cheque or bank statement', required: false },
] as const;

const DOC_KEYS = DOCUMENT_CONFIG.map(d => d.key);
type DocKey = (typeof DOC_KEYS)[number];

type DocumentUpload = {
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  verified: boolean;
};

type Documents = Partial<Record<DocKey, DocumentUpload>>;

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
  documents?: Documents;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
};

// Demo data - replace with API fetch
const DUMMY_COMPANIES: CompanyApproval[] = [
  {
    id: '1',
    userId: 'user1',
    companyName: 'TechCorp Solutions Pvt Ltd',
    address: '123 Innovation Park, Electronic City Phase 1, Bangalore, Karnataka 560100',
    contactPerson: 'Rajesh Kumar',
    contactEmail: 'rajesh@techcorp.com',
    contactPhone: '+91-9876543210',
    taxId: '29AABCT1234F1Z5',
    website: 'https://techcorpsolutions.com',
    numberOfEmployees: '50-100',
    documents: {
      certificateOfIncorporation: { fileName: 'TechCorp_COI_2024.pdf', fileUrl: 'https://storage.example.com/docs/techcorp_coi.pdf', uploadedAt: '2026-01-25T10:30:00Z', verified: false },
      gstCertificate: { fileName: 'GST_Registration.pdf', fileUrl: 'https://storage.example.com/docs/gst_cert.pdf', uploadedAt: '2026-01-25T10:32:00Z', verified: false },
      panCard: { fileName: 'Company_PAN.pdf', fileUrl: 'https://storage.example.com/docs/pan.pdf', uploadedAt: '2026-01-25T10:34:00Z', verified: false },
      addressProof: { fileName: 'Office_Lease_Agreement.pdf', fileUrl: 'https://storage.example.com/docs/lease.pdf', uploadedAt: '2026-01-25T10:36:00Z', verified: false },
      authorizedSignatoryId: { fileName: 'Director_Aadhar.pdf', fileUrl: 'https://storage.example.com/docs/aadhar.pdf', uploadedAt: '2026-01-25T10:38:00Z', verified: false },
      bankDocument: { fileName: 'Cancelled_Cheque.pdf', fileUrl: 'https://storage.example.com/docs/cheque.pdf', uploadedAt: '2026-01-25T10:40:00Z', verified: false },
    },
    status: 'pending',
    createdAt: '2026-01-25T10:00:00Z',
    updatedAt: '2026-01-25T10:40:00Z',
  },
  {
    id: '2',
    userId: 'user2',
    companyName: 'StartupXYZ Innovations',
    address: '456 Startup Hub, HSR Layout, Bangalore, Karnataka 560102',
    contactPerson: 'Priya Sharma',
    contactEmail: 'priya@startupxyz.in',
    contactPhone: '+91-8765432109',
    taxId: '29ABCST5678G2Z1',
    website: 'https://startupxyz.in',
    numberOfEmployees: '10-50',
    documents: {
      certificateOfIncorporation: { fileName: 'StartupXYZ_Incorporation.pdf', fileUrl: 'https://storage.example.com/docs/xyz_coi.pdf', uploadedAt: '2026-01-26T14:20:00Z', verified: false },
      gstCertificate: { fileName: 'XYZ_GST_Certificate.pdf', fileUrl: 'https://storage.example.com/docs/xyz_gst.pdf', uploadedAt: '2026-01-26T14:22:00Z', verified: false },
      panCard: { fileName: 'XYZ_PAN_Card.pdf', fileUrl: 'https://storage.example.com/docs/xyz_pan.pdf', uploadedAt: '2026-01-26T14:24:00Z', verified: false },
      addressProof: { fileName: 'Utility_Bill_Dec2025.pdf', fileUrl: 'https://storage.example.com/docs/xyz_utility.pdf', uploadedAt: '2026-01-26T14:26:00Z', verified: false },
      authorizedSignatoryId: { fileName: 'Founder_Passport.pdf', fileUrl: 'https://storage.example.com/docs/xyz_passport.pdf', uploadedAt: '2026-01-26T14:28:00Z', verified: false },
    },
    status: 'pending',
    createdAt: '2026-01-26T14:00:00Z',
    updatedAt: '2026-01-26T14:28:00Z',
  },
  {
    id: '3',
    userId: 'user3',
    companyName: 'Digital Dreams Agency',
    address: '789 Creative Tower, Koramangala 5th Block, Bangalore, Karnataka 560095',
    contactPerson: 'Amit Patel',
    contactEmail: 'amit@digitaldreams.co',
    contactPhone: '+91-7654321098',
    taxId: '29CDFDD9012H3Z2',
    website: 'https://digitaldreams.co',
    numberOfEmployees: '10-50',
    documents: {
      certificateOfIncorporation: { fileName: 'DD_Certificate_of_Incorporation.pdf', fileUrl: 'https://storage.example.com/docs/dd_coi.pdf', uploadedAt: '2026-01-28T09:15:00Z', verified: false },
      gstCertificate: { fileName: 'DD_GST_Registration.pdf', fileUrl: 'https://storage.example.com/docs/dd_gst.pdf', uploadedAt: '2026-01-28T09:18:00Z', verified: false },
      panCard: { fileName: 'DD_Company_PAN.pdf', fileUrl: 'https://storage.example.com/docs/dd_pan.pdf', uploadedAt: '2026-01-28T09:20:00Z', verified: false },
      addressProof: { fileName: 'DD_Office_NOC.pdf', fileUrl: 'https://storage.example.com/docs/dd_noc.pdf', uploadedAt: '2026-01-28T09:22:00Z', verified: false },
      authorizedSignatoryId: { fileName: 'CEO_VoterID.pdf', fileUrl: 'https://storage.example.com/docs/dd_voter.pdf', uploadedAt: '2026-01-28T09:24:00Z', verified: false },
      bankDocument: { fileName: 'Bank_Statement_Jan2026.pdf', fileUrl: 'https://storage.example.com/docs/dd_bank.pdf', uploadedAt: '2026-01-28T09:26:00Z', verified: false },
    },
    status: 'pending',
    createdAt: '2026-01-28T09:00:00Z',
    updatedAt: '2026-01-28T09:26:00Z',
  },
];

function getDoc(docs: Documents | undefined, key: string): DocumentUpload | undefined {
  if (!docs) return undefined;
  return docs[key as DocKey];
}

function hasDoc(docs: Documents | undefined, key: string): boolean {
  return !!getDoc(docs, key);
}

export function useAdminCompanyRequests() {
  const [pendingCompanies, setPendingCompanies] = useState<CompanyApproval[]>(DUMMY_COMPANIES);
  const [selectedCompany, setSelectedCompany] = useState<CompanyApproval | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [documentVerification, setDocumentVerification] = useState<Record<string, boolean>>({});

  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return pendingCompanies;
    const q = searchQuery.toLowerCase();
    return pendingCompanies.filter(c =>
      c.companyName.toLowerCase().includes(q) ||
      c.contactEmail.toLowerCase().includes(q) ||
      (c.contactPerson ?? '').toLowerCase().includes(q)
    );
  }, [pendingCompanies, searchQuery]);

  const initializeVerification = useCallback((company: CompanyApproval) => {
    const init: Record<string, boolean> = {};
    if (company.documents) {
      for (const doc of DOCUMENT_CONFIG) {
        const uploaded = getDoc(company.documents, doc.key);
        if (uploaded) init[doc.key] = uploaded.verified || false;
      }
    }
    setDocumentVerification(init);
  }, []);

  const selectCompany = useCallback((company: CompanyApproval) => {
    setSelectedCompany(company);
    initializeVerification(company);
  }, [initializeVerification]);

  const clearSelectedCompany = useCallback(() => {
    setSelectedCompany(null);
    setDocumentVerification({});
  }, []);

  const handleApprove = useCallback(async (companyId: string) => {
    // TODO: Replace with actual API call
    setPendingCompanies(prev => prev.filter(c => c.id !== companyId));
    setSelectedCompany(null);
    setDocumentVerification({});
    alert('Company approved successfully!');
  }, []);

  const handleRejectClick = useCallback(() => setShowRejectModal(true), []);
  const closeRejectModal = useCallback(() => {
    setShowRejectModal(false);
    setRejectionReason('');
  }, []);

  const handleRejectConfirm = useCallback(async () => {
    if (!selectedCompany || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    // TODO: Replace with actual API call
    setPendingCompanies(prev => prev.filter(c => c.id !== selectedCompany.id));
    setShowRejectModal(false);
    setRejectionReason('');
    setSelectedCompany(null);
    setDocumentVerification({});
    alert('Company rejected successfully');
  }, [selectedCompany, rejectionReason]);

  const toggleDocVerification = useCallback((docKey: string) => {
    setDocumentVerification(prev => ({ ...prev, [docKey]: !prev[docKey] }));
  }, []);

  const getDocumentCount = useCallback((docs?: Documents) => {
    if (!docs) return { uploaded: 0, total: DOCUMENT_CONFIG.length };
    const uploaded = DOCUMENT_CONFIG.filter(d => hasDoc(docs, d.key)).length;
    return { uploaded, total: DOCUMENT_CONFIG.length };
  }, []);

  const getRequiredDocsUploaded = useCallback((docs?: Documents) => {
    if (!docs) return false;
    return DOCUMENT_CONFIG.filter(d => d.required).every(d => hasDoc(docs, d.key));
  }, []);

  const getVerifiedCount = useCallback(() => Object.values(documentVerification).filter(Boolean).length, [documentVerification]);

  const getUploadedDocsCount = useCallback(() => {
    if (!selectedCompany?.documents) return 0;
    return DOCUMENT_CONFIG.filter(d => hasDoc(selectedCompany.documents, d.key)).length;
  }, [selectedCompany]);

  const areAllDocsVerified = useCallback(() => {
    if (!selectedCompany?.documents) return false;
    const uploaded = DOCUMENT_CONFIG.filter(d => hasDoc(selectedCompany.documents, d.key));
    return uploaded.every(d => documentVerification[d.key]);
  }, [selectedCompany, documentVerification]);

  const getUploadedDoc = useCallback((docKey: string) => getDoc(selectedCompany?.documents, docKey), [selectedCompany]);

  return {
    pendingCompanies,
    filteredCompanies,
    selectedCompany,
    documentVerification,
    documentConfig: DOCUMENT_CONFIG,
    searchQuery,
    setSearchQuery,
    showRejectModal,
    rejectionReason,
    setRejectionReason,
    selectCompany,
    clearSelectedCompany,
    handleApprove,
    handleRejectClick,
    handleRejectConfirm,
    closeRejectModal,
    toggleDocVerification,
    getDocumentCount,
    getRequiredDocsUploaded,
    getVerifiedCount,
    getUploadedDocsCount,
    areAllDocsVerified,
    getUploadedDoc,
  };
}

export default useAdminCompanyRequests;
