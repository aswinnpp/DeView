import { api } from '../api/axios';
import type { CompanyApprovalFormValues } from '@/utils/validation/companyApproval/companyApprovalSchema';

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
    /** Submit the company approval form */
    submit(data: CompanyApprovalFormValues) {
        return api.post<SubmitCompanyApprovalResponse>('/company/submit', data);
    },

    /** Get the current company's approval status */
    getMyApproval() {
        return api.get<CompanyApprovalStatus>('/company/my-approval');
    },
};
