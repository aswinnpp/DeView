import { useState, useMemo, useCallback } from "react";

// Types
interface DocumentUpload {
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
    verified: boolean;
}

interface CompanyDocuments {
    certificateOfIncorporation?: DocumentUpload;
    gstCertificate?: DocumentUpload;
    panCard?: DocumentUpload;
    addressProof?: DocumentUpload;
    authorizedSignatoryId?: DocumentUpload;
    bankDocument?: DocumentUpload;
}

interface CompanyApproval {
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
    documents?: CompanyDocuments;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
}

interface DocumentConfig {
    key: string;
    label: string;
    shortLabel: string;
    description: string;
    required: boolean;
}

export interface UseAdminCompanyRequestsReturn {
    // Data
    pendingCompanies: CompanyApproval[];
    filteredCompanies: CompanyApproval[];
    selectedCompany: CompanyApproval | null;
    documentVerification: Record<string, boolean>;
    documentConfig: DocumentConfig[];

    // State
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    showRejectModal: boolean;
    rejectionReason: string;
    setRejectionReason: (reason: string) => void;

    // Actions
    selectCompany: (company: CompanyApproval) => void;
    clearSelectedCompany: () => void;
    handleApprove: (companyId: string) => Promise<void>;
    handleRejectClick: () => void;
    handleRejectConfirm: () => Promise<void>;
    closeRejectModal: () => void;
    toggleDocVerification: (docKey: string) => void;

    // Utilities
    getDocumentCount: (docs?: CompanyDocuments) => { uploaded: number; total: number };
    getRequiredDocsUploaded: (docs?: CompanyDocuments) => boolean;
    getVerifiedCount: () => number;
    getUploadedDocsCount: () => number;
    areAllDocsVerified: () => boolean;
    getUploadedDoc: (docKey: string) => DocumentUpload | undefined;
}

// Document configuration
const DOCUMENT_CONFIG: DocumentConfig[] = [
    {
        key: 'certificateOfIncorporation',
        label: 'Certificate of Incorporation',
        shortLabel: 'Incorporation',
        description: 'Legal document proving business registration',
        required: true
    },
    {
        key: 'gstCertificate',
        label: 'GST Certificate',
        shortLabel: 'GST',
        description: 'Goods and Services Tax registration',
        required: true
    },
    {
        key: 'panCard',
        label: 'Company PAN Card',
        shortLabel: 'PAN Card',
        description: 'Permanent Account Number card',
        required: true
    },
    {
        key: 'addressProof',
        label: 'Address Proof',
        shortLabel: 'Address',
        description: 'Utility bill or lease agreement',
        required: true
    },
    {
        key: 'authorizedSignatoryId',
        label: 'Authorized Signatory ID',
        shortLabel: 'Signatory ID',
        description: 'ID proof of authorized person',
        required: true
    },
    {
        key: 'bankDocument',
        label: 'Bank Document',
        shortLabel: 'Bank',
        description: 'Cancelled cheque or bank statement',
        required: false
    }
];

// Dummy data for demonstration
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
            certificateOfIncorporation: {
                fileName: 'TechCorp_COI_2024.pdf',
                fileUrl: 'https://storage.example.com/docs/techcorp_coi.pdf',
                uploadedAt: '2026-01-25T10:30:00Z',
                verified: false
            },
            gstCertificate: {
                fileName: 'GST_Registration.pdf',
                fileUrl: 'https://storage.example.com/docs/gst_cert.pdf',
                uploadedAt: '2026-01-25T10:32:00Z',
                verified: false
            },
            panCard: {
                fileName: 'Company_PAN.pdf',
                fileUrl: 'https://storage.example.com/docs/pan.pdf',
                uploadedAt: '2026-01-25T10:34:00Z',
                verified: false
            },
            addressProof: {
                fileName: 'Office_Lease_Agreement.pdf',
                fileUrl: 'https://storage.example.com/docs/lease.pdf',
                uploadedAt: '2026-01-25T10:36:00Z',
                verified: false
            },
            authorizedSignatoryId: {
                fileName: 'Director_Aadhar.pdf',
                fileUrl: 'https://storage.example.com/docs/aadhar.pdf',
                uploadedAt: '2026-01-25T10:38:00Z',
                verified: false
            },
            bankDocument: {
                fileName: 'Cancelled_Cheque.pdf',
                fileUrl: 'https://storage.example.com/docs/cheque.pdf',
                uploadedAt: '2026-01-25T10:40:00Z',
                verified: false
            }
        },
        status: 'pending',
        createdAt: '2026-01-25T10:00:00Z',
        updatedAt: '2026-01-25T10:40:00Z'
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
            certificateOfIncorporation: {
                fileName: 'StartupXYZ_Incorporation.pdf',
                fileUrl: 'https://storage.example.com/docs/xyz_coi.pdf',
                uploadedAt: '2026-01-26T14:20:00Z',
                verified: false
            },
            gstCertificate: {
                fileName: 'XYZ_GST_Certificate.pdf',
                fileUrl: 'https://storage.example.com/docs/xyz_gst.pdf',
                uploadedAt: '2026-01-26T14:22:00Z',
                verified: false
            },
            panCard: {
                fileName: 'XYZ_PAN_Card.pdf',
                fileUrl: 'https://storage.example.com/docs/xyz_pan.pdf',
                uploadedAt: '2026-01-26T14:24:00Z',
                verified: false
            },
            addressProof: {
                fileName: 'Utility_Bill_Dec2025.pdf',
                fileUrl: 'https://storage.example.com/docs/xyz_utility.pdf',
                uploadedAt: '2026-01-26T14:26:00Z',
                verified: false
            },
            authorizedSignatoryId: {
                fileName: 'Founder_Passport.pdf',
                fileUrl: 'https://storage.example.com/docs/xyz_passport.pdf',
                uploadedAt: '2026-01-26T14:28:00Z',
                verified: false
            }
        },
        status: 'pending',
        createdAt: '2026-01-26T14:00:00Z',
        updatedAt: '2026-01-26T14:28:00Z'
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
            certificateOfIncorporation: {
                fileName: 'DD_Certificate_of_Incorporation.pdf',
                fileUrl: 'https://storage.example.com/docs/dd_coi.pdf',
                uploadedAt: '2026-01-28T09:15:00Z',
                verified: false
            },
            gstCertificate: {
                fileName: 'DD_GST_Registration.pdf',
                fileUrl: 'https://storage.example.com/docs/dd_gst.pdf',
                uploadedAt: '2026-01-28T09:18:00Z',
                verified: false
            },
            panCard: {
                fileName: 'DD_Company_PAN.pdf',
                fileUrl: 'https://storage.example.com/docs/dd_pan.pdf',
                uploadedAt: '2026-01-28T09:20:00Z',
                verified: false
            },
            addressProof: {
                fileName: 'DD_Office_NOC.pdf',
                fileUrl: 'https://storage.example.com/docs/dd_noc.pdf',
                uploadedAt: '2026-01-28T09:22:00Z',
                verified: false
            },
            authorizedSignatoryId: {
                fileName: 'CEO_VoterID.pdf',
                fileUrl: 'https://storage.example.com/docs/dd_voter.pdf',
                uploadedAt: '2026-01-28T09:24:00Z',
                verified: false
            },
            bankDocument: {
                fileName: 'Bank_Statement_Jan2026.pdf',
                fileUrl: 'https://storage.example.com/docs/dd_bank.pdf',
                uploadedAt: '2026-01-28T09:26:00Z',
                verified: false
            }
        },
        status: 'pending',
        createdAt: '2026-01-28T09:00:00Z',
        updatedAt: '2026-01-28T09:26:00Z'
    }
];

export const useAdminCompanyRequests = (): UseAdminCompanyRequestsReturn => {
    // State
    const [pendingCompanies, setPendingCompanies] = useState<CompanyApproval[]>(DUMMY_COMPANIES);
    const [selectedCompany, setSelectedCompany] = useState<CompanyApproval | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [documentVerification, setDocumentVerification] = useState<Record<string, boolean>>({});

    // Filtered companies based on search
    const filteredCompanies = useMemo(() => {
        if (!searchQuery.trim()) return pendingCompanies;
        const query = searchQuery.toLowerCase();
        return pendingCompanies.filter(company =>
            company.companyName.toLowerCase().includes(query) ||
            company.contactEmail.toLowerCase().includes(query) ||
            company.contactPerson?.toLowerCase().includes(query)
        );
    }, [pendingCompanies, searchQuery]);

    // Initialize verification state when selecting a company
    const initializeVerification = useCallback((company: CompanyApproval) => {
        const initialState: Record<string, boolean> = {};
        if (company.documents) {
            DOCUMENT_CONFIG.forEach(doc => {
                const uploadedDoc = company.documents?.[doc.key as keyof CompanyDocuments];
                if (uploadedDoc) {
                    initialState[doc.key] = uploadedDoc.verified || false;
                }
            });
        }
        setDocumentVerification(initialState);
    }, []);

    // Select a company for review
    const selectCompany = useCallback((company: CompanyApproval) => {
        setSelectedCompany(company);
        initializeVerification(company);
    }, [initializeVerification]);

    // Clear selected company
    const clearSelectedCompany = useCallback(() => {
        setSelectedCompany(null);
        setDocumentVerification({});
    }, []);

    // Approve company
    const handleApprove = useCallback(async (companyId: string) => {
        // TODO: Replace with actual API call
        setPendingCompanies(prev => prev.filter(c => c.id !== companyId));
        setSelectedCompany(null);
        setDocumentVerification({});
        alert('Company approved successfully!');
    }, []);

    // Show reject modal
    const handleRejectClick = useCallback(() => {
        setShowRejectModal(true);
    }, []);

    // Close reject modal
    const closeRejectModal = useCallback(() => {
        setShowRejectModal(false);
        setRejectionReason("");
    }, []);

    // Confirm rejection
    const handleRejectConfirm = useCallback(async () => {
        if (!selectedCompany || !rejectionReason.trim()) {
            alert("Please provide a reason for rejection");
            return;
        }

        // TODO: Replace with actual API call
        setPendingCompanies(prev => prev.filter(c => c.id !== selectedCompany.id));
        setShowRejectModal(false);
        setRejectionReason("");
        setSelectedCompany(null);
        setDocumentVerification({});
        alert('Company rejected successfully');
    }, [selectedCompany, rejectionReason]);

    // Toggle document verification status
    const toggleDocVerification = useCallback((docKey: string) => {
        setDocumentVerification(prev => ({
            ...prev,
            [docKey]: !prev[docKey]
        }));
    }, []);

    // Get document count
    const getDocumentCount = useCallback((docs?: CompanyDocuments) => {
        if (!docs) return { uploaded: 0, total: DOCUMENT_CONFIG.length };
        const uploaded = DOCUMENT_CONFIG.filter(d => docs[d.key as keyof CompanyDocuments]).length;
        return { uploaded, total: DOCUMENT_CONFIG.length };
    }, []);

    // Check if all required docs are uploaded
    const getRequiredDocsUploaded = useCallback((docs?: CompanyDocuments) => {
        if (!docs) return false;
        const requiredDocs = DOCUMENT_CONFIG.filter(d => d.required);
        return requiredDocs.every(d => docs[d.key as keyof CompanyDocuments]);
    }, []);

    // Get verified documents count
    const getVerifiedCount = useCallback(() => {
        return Object.values(documentVerification).filter(v => v).length;
    }, [documentVerification]);

    // Get uploaded documents count for selected company
    const getUploadedDocsCount = useCallback(() => {
        if (!selectedCompany?.documents) return 0;
        return DOCUMENT_CONFIG.filter(d => selectedCompany.documents?.[d.key as keyof CompanyDocuments]).length;
    }, [selectedCompany]);

    // Check if all uploaded docs are verified
    const areAllDocsVerified = useCallback(() => {
        if (!selectedCompany?.documents) return false;
        const uploadedDocs = DOCUMENT_CONFIG.filter(d => selectedCompany.documents?.[d.key as keyof CompanyDocuments]);
        return uploadedDocs.every(d => documentVerification[d.key]);
    }, [selectedCompany, documentVerification]);

    // Get uploaded document by key
    const getUploadedDoc = useCallback((docKey: string): DocumentUpload | undefined => {
        return selectedCompany?.documents?.[docKey as keyof CompanyDocuments];
    }, [selectedCompany]);

    return {
        // Data
        pendingCompanies,
        filteredCompanies,
        selectedCompany,
        documentVerification,
        documentConfig: DOCUMENT_CONFIG,

        // State
        searchQuery,
        setSearchQuery,
        showRejectModal,
        rejectionReason,
        setRejectionReason,

        // Actions
        selectCompany,
        clearSelectedCompany,
        handleApprove,
        handleRejectClick,
        handleRejectConfirm,
        closeRejectModal,
        toggleDocVerification,

        // Utilities
        getDocumentCount,
        getRequiredDocsUploaded,
        getVerifiedCount,
        getUploadedDocsCount,
        areAllDocsVerified,
        getUploadedDoc,
    };
};

export default useAdminCompanyRequests;
