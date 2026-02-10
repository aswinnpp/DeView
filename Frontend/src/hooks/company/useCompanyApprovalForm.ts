import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../useApi';

// Types
interface DocumentUpload {
    fileName: string;
    fileUrl: string;
    uploadedAt: Date;
}

interface CompanyDocuments {
    certificateOfIncorporation?: DocumentUpload;
    gstCertificate?: DocumentUpload;
    panCard?: DocumentUpload;
    addressProof?: DocumentUpload;
    authorizedSignatoryId?: DocumentUpload;
    bankDocument?: DocumentUpload;
}

interface FormData {
    companyName: string;
    address: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    taxId: string;
    website: string;
    numberOfEmployees: string;
}

interface DocumentType {
    key: string;
    label: string;
    description: string;
    required: boolean;
}

export interface UseCompanyApprovalFormReturn {
    // Form data
    formData: FormData;
    documents: CompanyDocuments;
    documentTypes: DocumentType[];

    // State
    error: string;
    isSubmitting: boolean;
    uploadingDoc: string | null;

    // Actions
    updateFormField: (field: keyof FormData, value: string) => void;
    handleFileUpload: (docKey: string, e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRemoveDocument: (docKey: string) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;

    // Utilities
    getDocumentCount: () => number;
    getRequiredDocCount: () => number;
    getUploadedDoc: (docKey: string) => DocumentUpload | undefined;
    isDocUploading: (docKey: string) => boolean;
}

// Document configuration
const DOCUMENT_TYPES: DocumentType[] = [
    {
        key: 'certificateOfIncorporation',
        label: 'Certificate of Incorporation',
        description: 'Legal document proving business registration (CIN)',
        required: true
    },
    {
        key: 'gstCertificate',
        label: 'GST Certificate',
        description: 'Goods and Services Tax registration certificate',
        required: true
    },
    {
        key: 'panCard',
        label: 'Company PAN Card',
        description: 'Permanent Account Number card for the business',
        required: true
    },
    {
        key: 'addressProof',
        label: 'Address Proof',
        description: 'Utility bill, lease agreement, or property documents',
        required: true
    },
    {
        key: 'authorizedSignatoryId',
        label: 'Authorized Signatory ID',
        description: 'Aadhar Card, Passport, or Voter ID of the authorized person',
        required: true
    },
    {
        key: 'bankDocument',
        label: 'Bank Verification Document',
        description: 'Cancelled cheque or bank statement (last 3 months)',
        required: false
    }
];

export function useCompanyApprovalForm(): UseCompanyApprovalFormReturn {
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState<FormData>({
        companyName: "",
        address: "",
        contactPerson: "",
        contactEmail: "",
        contactPhone: "",
        taxId: "",
        website: "",
        numberOfEmployees: "1-10"
    });

    // Documents state
    const [documents, setDocuments] = useState<CompanyDocuments>({});

    // UI state
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

    // API hook
    const { execute: submitApproval } = useApi('/company/submit', 'POST');

    // Update form field
    const updateFormField = useCallback((field: keyof FormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    // Handle file upload
    const handleFileUpload = useCallback((docKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploadingDoc(docKey);

            // TODO: Replace with actual file upload to cloud storage
            setTimeout(() => {
                setDocuments(prev => ({
                    ...prev,
                    [docKey]: {
                        fileName: file.name,
                        fileUrl: `https://storage.example.com/docs/${Date.now()}_${file.name}`,
                        uploadedAt: new Date()
                    }
                }));
                setUploadingDoc(null);
            }, 500);
        }
    }, []);

    // Remove document
    const handleRemoveDocument = useCallback((docKey: string) => {
        setDocuments(prev => {
            const updated = { ...prev };
            delete updated[docKey as keyof CompanyDocuments];
            return updated;
        });
    }, []);

    // Validate documents
    const validateDocuments = useCallback(() => {
        const requiredDocs = DOCUMENT_TYPES.filter(d => d.required);
        const missingDocs = requiredDocs.filter(d => !documents[d.key as keyof CompanyDocuments]);
        return missingDocs;
    }, [documents]);

    // Handle form submission
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const missingDocs = validateDocuments();
        if (missingDocs.length > 0) {
            setError(`Please upload required documents: ${missingDocs.map(d => d.label).join(', ')}`);
            return;
        }

        setIsSubmitting(true);

        try {
            await submitApproval({
                data: {
                    ...formData,
                    documents: documents,
                }
            });

            navigate('/company/approval-pending');
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Failed to submit approval request');
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, documents, validateDocuments, submitApproval, navigate]);

    // Get document count
    const getDocumentCount = useCallback(() => {
        return Object.keys(documents).length;
    }, [documents]);

    // Get required document count
    const getRequiredDocCount = useCallback(() => {
        return DOCUMENT_TYPES.filter(d => d.required).length;
    }, []);

    // Get uploaded document by key
    const getUploadedDoc = useCallback((docKey: string): DocumentUpload | undefined => {
        return documents[docKey as keyof CompanyDocuments];
    }, [documents]);

    // Check if document is uploading
    const isDocUploading = useCallback((docKey: string): boolean => {
        return uploadingDoc === docKey;
    }, [uploadingDoc]);

    return {
        // Form data
        formData,
        documents,
        documentTypes: DOCUMENT_TYPES,

        // State
        error,
        isSubmitting,
        uploadingDoc,

        // Actions
        updateFormField,
        handleFileUpload,
        handleRemoveDocument,
        handleSubmit,

        // Utilities
        getDocumentCount,
        getRequiredDocCount,
        getUploadedDoc,
        isDocUploading,
    };
}

export default useCompanyApprovalForm;
