import { api } from '../api/axios';
import { API_ROUTES } from '../constants/routes';
import type { SubmitCompanyApprovalRequest } from '@shared/contracts/companyApproval/submit';

// ─── Types ──────────────────────────────────────────────────────

export type SubmitCompanyApprovalResponse = { message?: string };

export type CompanyApprovalStatus = {
    id: string;
    companyName: string;
    address: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    taxId: string;
    website?: string;
    numberOfEmployees: string;
    documents?: Record<string, {
        fileName: string;
        fileUrl: string;
        uploadedAt: string;
        marked: boolean;
    }>;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    createdAt: string;
};

// ─── Service functions ──────────────────────────────────────────

export const companyApprovalService = {
    submit(data: SubmitCompanyApprovalRequest) {
        return api.post<SubmitCompanyApprovalResponse>(API_ROUTES.COMPANY.SUBMIT_APPROVAL, data);
    },

    getMyApproval() {
        return api.get<CompanyApprovalStatus>(API_ROUTES.COMPANY.MY_APPROVAL);
    },
};
