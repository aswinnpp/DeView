import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormInput, Button } from '../../components/common';
import './CompanyStyles.css';
import { useApi } from '../../hooks/useApi';

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

const DOCUMENT_TYPES = [
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

const CompanyApprovalFormPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        companyName: "",
        address: "",
        contactPerson: "",
        contactEmail: "",
        contactPhone: "",
        taxId: "",
        website: "",
        numberOfEmployees: "1-10"
    });

    const [documents, setDocuments] = useState<CompanyDocuments>({});
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

    const { execute: checkExistingApproval } = useApi({
        url: '/company-approvals/my-approval',
        method: 'GET',
        immediate: false,
        requireAuth: true,
    });

    const { execute: submitApproval } = useApi({
        url: '/company-approvals/submit',
        method: 'POST',
        immediate: false,
        requireAuth: true,
    });

    useEffect(() => {
        const exchangeToken = async () => {
            try {
                const response = await fetch('http://localhost:3000/auth/google/exchange', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const { token, role } = await response.json();
                    localStorage.setItem("accessToken", token);
                    localStorage.setItem("user", JSON.stringify({ role }));
                    console.log('✅ Token exchanged successfully');
                    return true;
                } else {
                    console.log('No OAuth session found (normal for non-OAuth login)');
                    return false;
                }
            } catch (error) {
                console.log('Token exchange not needed or failed:', error);
                return false;
            }
        };

        const initializeAuth = async () => {
            if (!localStorage.getItem("accessToken")) {
                await exchangeToken();
            }

            try {
                console.log('Checking for existing approval...');
                const response = await checkExistingApproval() as any;
                console.log('Full response:', response);

                if (response?.data) {
                    const approval = response.data;
                    console.log('Company approval found:', approval);

                    if (approval.status === 'approved') {
                        console.log('Company approved - redirecting to dashboard');
                        navigate('/company/dashboard');
                    } else if (approval.status === 'pending') {
                        console.log('Company pending - redirecting to pending page');
                        navigate('/company/approval-pending');
                    } else if (approval.status === 'rejected') {
                        console.log('Company rejected - redirecting to pending page');
                        navigate('/company/approval-pending');
                    }
                } else {
                    console.log('No approval data in response');
                }
            } catch (err: any) {
                console.log('Error checking approval:', err);
                console.log('No existing approval found - showing form');
            }
        };

        initializeAuth();
    }, [navigate]);

    const handleFileUpload = (docKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploadingDoc(docKey);

            // Simulate file upload - in real implementation, this would upload to cloud storage
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
    };

    const handleRemoveDocument = (docKey: string) => {
        setDocuments(prev => {
            const updated = { ...prev };
            delete updated[docKey as keyof CompanyDocuments];
            return updated;
        });
    };

    const validateDocuments = () => {
        const requiredDocs = DOCUMENT_TYPES.filter(d => d.required);
        const missingDocs = requiredDocs.filter(d => !documents[d.key as keyof CompanyDocuments]);
        return missingDocs;
    };

    const handleSubmit = async (e: React.FormEvent) => {
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
    };

    const getDocumentCount = () => {
        return Object.keys(documents).length;
    };

    const getRequiredDocCount = () => {
        return DOCUMENT_TYPES.filter(d => d.required).length;
    };

    return (
        <div className="company-approval-container">
            <header className="company-approval-header">
                <div className="header-content">
                    <div className="logo-section">
                        <div className="logo-icon-text">CO</div>
                        <h1>Company Onboarding</h1>
                    </div>
                    <div className="progress-indicator">
                        <span className="progress-text">Documents: {getDocumentCount()}/{DOCUMENT_TYPES.length}</span>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${(getDocumentCount() / DOCUMENT_TYPES.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </header>

            <main className="company-approval-main">
                <div className="approval-form-card">
                    <div className="form-header">
                        <h2>Company Verification</h2>
                        <p>Please provide your company details and upload required documents for verification.
                            Our team will review your application within 2-3 business days.</p>
                    </div>

                    {error && (
                        <div className="error-alert">
                            <span className="error-icon">!</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="approval-form">
                        {/* Company Information Section */}
                        <section className="form-section">
                            <h3 className="section-title">
                                <span className="section-number">1</span>
                                Company Information
                            </h3>

                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <FormInput
                                        type="text"
                                        label="Company Name"
                                        value={formData.companyName}
                                        onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <FormInput
                                        type="text"
                                        label="Registered Address"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="input-label">GST Number / Tax ID *</label>
                                    <input
                                        type="text"
                                        className="custom-input"
                                        value={formData.taxId}
                                        onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                                        placeholder="e.g., 29ABCDE1234F1Z5"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="input-label">Number of Employees *</label>
                                    <select
                                        className="custom-select"
                                        value={formData.numberOfEmployees}
                                        onChange={e => setFormData({ ...formData, numberOfEmployees: e.target.value })}
                                        required
                                    >
                                        <option value="1-10">1-10 Employees</option>
                                        <option value="10-50">10-50 Employees</option>
                                        <option value="50-100">50-100 Employees</option>
                                        <option value="100-500">100-500 Employees</option>
                                        <option value="500+">500+ Employees</option>
                                    </select>
                                </div>

                                <div className="form-group full-width">
                                    <label className="input-label">Company Website</label>
                                    <input
                                        type="url"
                                        className="custom-input"
                                        value={formData.website}
                                        onChange={e => setFormData({ ...formData, website: e.target.value })}
                                        placeholder="https://www.yourcompany.com"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Contact Information Section */}
                        <section className="form-section">
                            <h3 className="section-title">
                                <span className="section-number">2</span>
                                Contact Information
                            </h3>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="input-label">Authorized Contact Person *</label>
                                    <input
                                        type="text"
                                        className="custom-input"
                                        value={formData.contactPerson}
                                        onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                                        placeholder="Full Name"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="input-label">Business Email *</label>
                                    <input
                                        type="email"
                                        className="custom-input"
                                        value={formData.contactEmail}
                                        onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                                        placeholder="contact@company.com"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="input-label">Contact Phone *</label>
                                    <input
                                        type="tel"
                                        className="custom-input"
                                        value={formData.contactPhone}
                                        onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                                        placeholder="+91-9876543210"
                                        required
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Documents Section */}
                        <section className="form-section documents-section">
                            <h3 className="section-title">
                                <span className="section-number">3</span>
                                Verification Documents
                                <span className="required-badge">{getRequiredDocCount()} Required</span>
                            </h3>
                            <p className="section-description">
                                Upload clear, legible copies of the following documents. Accepted formats: PDF, JPG, PNG (Max 5MB each)
                            </p>

                            <div className="documents-grid">
                                {DOCUMENT_TYPES.map((docType) => {
                                    const uploadedDoc = documents[docType.key as keyof CompanyDocuments];
                                    const isUploading = uploadingDoc === docType.key;

                                    return (
                                        <div
                                            key={docType.key}
                                            className={`document-card ${uploadedDoc ? 'uploaded' : ''} ${docType.required ? 'required' : 'optional'}`}
                                        >
                                            <div className="doc-header">
                                                <span className="doc-number">{DOCUMENT_TYPES.indexOf(docType) + 1}</span>
                                                <div className="doc-info">
                                                    <h4 className="doc-title">
                                                        {docType.label}
                                                        {docType.required && <span className="required-star">*</span>}
                                                    </h4>
                                                    <p className="doc-description">{docType.description}</p>
                                                </div>
                                            </div>

                                            <div className="doc-upload-area">
                                                {isUploading ? (
                                                    <div className="uploading-state">
                                                        <div className="spinner"></div>
                                                        <span>Uploading...</span>
                                                    </div>
                                                ) : uploadedDoc ? (
                                                    <div className="uploaded-file">
                                                        <div className="file-info">
                                                            <span className="file-icon-check">✓</span>
                                                            <span className="file-name">{uploadedDoc.fileName}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="remove-btn"
                                                            onClick={() => handleRemoveDocument(docType.key)}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="upload-label">
                                                        <input
                                                            type="file"
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                            onChange={(e) => handleFileUpload(docType.key, e)}
                                                            className="file-input"
                                                        />
                                                        <div className="upload-content">
                                                            <span className="upload-icon-arrow">↑</span>
                                                            <span className="upload-text">Click to upload</span>
                                                        </div>
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Submit Section */}
                        <div className="submit-section">
                            <div className="terms-notice">
                                <span className="notice-icon-info">i</span>
                                <p>By submitting this form, you confirm that all information provided is accurate and the documents are authentic.
                                    False information may lead to rejection and legal action.</p>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                className="submit-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="btn-spinner"></span>
                                        Submitting Application...
                                    </>
                                ) : (
                                    'Submit for Verification'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CompanyApprovalFormPage;
