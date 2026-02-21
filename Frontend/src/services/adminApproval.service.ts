import { api } from '../api/axios';
import { API_ROUTES } from '../constants/routes';
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
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type GetPendingParams = {
    search?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
};

// ─── Service functions ──────────────────────────────────────────

export const adminApprovalService = {
    /** Fetch pending company-approval requests with pagination and sort */
    getPending(params?: GetPendingParams) {
        return api.get<{ data: CompanyApproval[]; total: number }>(API_ROUTES.ADMIN.COMPANY_PENDING, {
            params: params as Record<string, string | number | undefined>,
        });
    },

    /** Approve a company request */
    approve(id: string) {
        return api.post(API_ROUTES.ADMIN.COMPANY_APPROVE(id));
    },

    /** Reject a company request */
    reject(id: string, data: RejectCompanyRequestBody) {
        return api.post(API_ROUTES.ADMIN.COMPANY_REJECT(id), data);
    },

    /** Mark/unmark a specific document as verified */
    markDocument(companyId: string, documentKey: string, verified: boolean) {
        return api.patch(API_ROUTES.ADMIN.COMPANY_DOCUMENT_MARK(companyId, documentKey), { verified });
    },
};
