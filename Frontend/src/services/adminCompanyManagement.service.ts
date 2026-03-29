import { api } from '../api/axios';
import { API_ROUTES } from '../constants/routes';

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
    total: number;
};

type ToggleActiveResponse = { isActive: boolean  };


export type GetApprovedParams = {
    search?: string;
    status?: 'all' | 'active' | 'inactive';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
};

// ─── Service functions ──────────────────────────────────────────

export const adminCompanyManagementService = {

    getApproved(params?: GetApprovedParams) {
        const url = API_ROUTES.ADMIN.COMPANY_PENDING.replace('pending', 'approved');
        const query: Record<string, string | number | undefined> = {};
        if (params?.search) query.search = params.search;
        if (params?.status && params.status !== 'all') query.status = params.status;
        if (params?.sortOrder) query.sortOrder = params.sortOrder;
        if (params?.page != null) query.page = params.page;
        if (params?.limit != null) query.limit = params.limit;
        return api.get<GetApprovedResponse>(url, { params: query });
    },

    reject(id: string, reason: string) {
        return api.patch(API_ROUTES.ADMIN.COMPANY_REJECT(id), { reason });
    },

    toggleActive(id: string) {
        return api.patch<ToggleActiveResponse>(API_ROUTES.ADMIN.COMPANYTOGGLE(id));
    },
};
