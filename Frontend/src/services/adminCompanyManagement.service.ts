import { api } from '../api/axios';

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
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

type GetApprovedResponse = {
    approvals: CompanyApproval[];
};

// ─── Service functions ──────────────────────────────────────────

export const adminCompanyManagementService = {
    /** Fetch all approved companies */
    getApproved() {
        return api.get<GetApprovedResponse>('/admin/company-requests/approved');
    },

    /** Reject an approved company */
    reject(id: string, reason: string) {
        return api.post(`/admin/company-requests/${id}/reject`, { reason });
    },

    /** Toggle active/inactive status of a company */
    toggleActive(id: string) {
        return api.post(`/admin/company-requests/${id}/toggle-active`);
    },
};
