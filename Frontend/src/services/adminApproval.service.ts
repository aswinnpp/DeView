import { api } from '../api/axios';
import type { RejectCompanyRequestBody } from '@shared/contracts/companyApproval/admin';

// ─── Types (mirror what the backend returns) ────────────────────

export type DocumentUpload = {
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
    marked: boolean;
};

export type CompanyApproval = {
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

// ─── Service functions ──────────────────────────────────────────

export const adminApprovalService = {
    /** Fetch all pending company-approval requests */
    getPending() {
        return api.get<CompanyApproval[]>('/admin/company-requests/pending');
    },

    /** Approve a company request */
    approve(id: string) {
        return api.post(`/admin/company-requests/${id}/approve`);
    },

    /** Reject a company request */
    reject(id: string, data: RejectCompanyRequestBody) {
        return api.post(`/admin/company-requests/${id}/reject`, data);
    },

    /** Mark/unmark a specific document as verified */
    markDocument(companyId: string, documentKey: string, verified: boolean) {
        return api.patch(`/admin/company-requests/${companyId}/documents/${documentKey}/mark`, { verified });
    },
};
