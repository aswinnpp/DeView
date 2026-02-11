import { useState, useCallback } from 'react';
import { useApi } from '../useApi';

// Document config - what each document type needs
const DOCUMENT_TYPES = [
  { key: 'certificateOfIncorporation', label: 'Certificate of Incorporation', description: 'Legal document proving business registration (CIN)', required: true },
  { key: 'gstCertificate', label: 'GST Certificate', description: 'Goods and Services Tax registration certificate', required: true },
  { key: 'panCard', label: 'Company PAN Card', description: 'Permanent Account Number card for the business', required: true },
  { key: 'addressProof', label: 'Address Proof', description: 'Utility bill, lease agreement, or property documents', required: true },
  { key: 'authorizedSignatoryId', label: 'Authorized Signatory ID', description: 'Aadhar Card, Passport, or Voter ID of the authorized person', required: true },
  { key: 'bankDocument', label: 'Bank Verification Document', description: 'Cancelled cheque or bank statement (last 3 months)', required: false },
] as const;

// Keys we use for documents (derived from config)
const DOC_KEYS = DOCUMENT_TYPES.map(d => d.key);

type DocKey = (typeof DOC_KEYS)[number];

// Simple shape for an uploaded document
type DocumentUpload = {
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
};

// Documents stored by key
type Documents = Partial<Record<DocKey, DocumentUpload>>;

// Form fields
type FormData = {
  companyName: string;
  address: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  taxId: string;
  website: string;
  numberOfEmployees: string;
};

const INITIAL_FORM: FormData = {
  companyName: '',
  address: '',
  contactPerson: '',
  contactEmail: '',
  contactPhone: '',
  taxId: '',
  website: '',
  numberOfEmployees: '1-10',
};

export function useCompanyApprovalForm(options?: { onSuccess?: () => void }) {
  const onSuccess = options?.onSuccess;

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [documents, setDocuments] = useState<Documents>({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const { execute: submitApproval, error: apiError } = useApi<{ message?: string }>('/company/submit', 'POST');

  const updateFormField = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleFileUpload = useCallback((docKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(docKey);
    // TODO: Replace with actual file upload to cloud storage
    setDocuments(prev => ({
      ...prev,
      [docKey]: {
        fileName: file.name,
        fileUrl: `https://storage.example.com/docs/${Date.now()}_${file.name}`,
        uploadedAt: new Date(),
      },
    }));
    setUploadingDoc(null);
  }, []);

  const handleRemoveDocument = useCallback((docKey: string) => {
    setDocuments(prev => {
      const next = { ...prev };
      delete next[docKey as DocKey];
      return next;
    });
  }, []);

  const validateDocuments = useCallback((): string[] => {
    const missing: string[] = [];
    for (const doc of DOCUMENT_TYPES) {
      if (doc.required && !documents[doc.key]) {
        missing.push(doc.label);
      }
    }
    return missing;
  }, [documents]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      const missingDocs = validateDocuments();
      if (missingDocs.length > 0) {
        setError(`Please upload required documents: ${missingDocs.join(', ')}`);
        return;
      }

      setIsSubmitting(true);
      const response = await submitApproval({
        data: { ...formData, documents },
      });
      setIsSubmitting(false);

      if (response) {
        onSuccess?.();
      }
      // On failure, useApi already sets apiError - we expose it below
    },
    [formData, documents, validateDocuments, submitApproval, apiError, onSuccess]
  );

  const getDocumentCount = useCallback(() => Object.keys(documents).length, [documents]);
  const getRequiredDocCount = useCallback(() => DOCUMENT_TYPES.filter(d => d.required).length, []);
  const getUploadedDoc = useCallback((docKey: string) => documents[docKey as DocKey], [documents]);
  const isDocUploading = useCallback((docKey: string) => uploadingDoc === docKey, [uploadingDoc]);

  // Validation errors override API errors
  const displayError = error || apiError || null;

  return {
    formData,
    documents,
    documentTypes: DOCUMENT_TYPES,
    error: displayError,
    isSubmitting,
    uploadingDoc,
    updateFormField,
    handleFileUpload,
    handleRemoveDocument,
    handleSubmit,
    getDocumentCount,
    getRequiredDocCount,
    getUploadedDoc,
    isDocUploading,
  };
}

export default useCompanyApprovalForm;
