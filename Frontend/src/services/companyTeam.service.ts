import { api } from '../api/axios';
import { API_ROUTES } from '../constants/routes';

// ─── Types ──────────────────────────────────────────────────────

export type TeamMember = {
    id: string;
    fullName: string;
    email: string;
    isActive: boolean;
    createdAt?: string;
};

type ListResponse = {
    data: TeamMember[];
    total: number;
};

// ─── Service functions ──────────────────────────────────────────

export const companyTeamService = {
    // ── HR ────────────────────────────────────────────────────────

    /** Fetch HR users for this company (with optional search/status/page/limit) */
    listHRs(search?: string, status?: string, page?: number, limit?: number) {
        return api.get<ListResponse>(API_ROUTES.COMPANY.HR_LIST, {
            params: { search, status, page, limit },
        });
    },

    /** Create a new HR account */
    createHR(data: { fullName: string; email: string }) {
        return api.post(API_ROUTES.COMPANY.HR_CREATE, data);
    },

    /** Toggle HR active/inactive status */
    toggleHRStatus(id: string) {
        return api.patch(API_ROUTES.COMPANY.HR_TOGGLE_STATUS(id));
    },

    // ── Interviewer ──────────────────────────────────────────────

    /** Fetch Interviewer users for this company (with optional search/status/page/limit) */
    listInterviewers(search?: string, status?: string, page?: number, limit?: number) {
        return api.get<ListResponse>(API_ROUTES.COMPANY.INTERVIEWER_LIST, {
            params: { search, status, page, limit },
        });
    },

    /** Create a new Interviewer account */
    createInterviewer(data: { fullName: string; email: string }) {
        return api.post(API_ROUTES.COMPANY.INTERVIEWER_CREATE, data);
    },

    /** Toggle Interviewer active/inactive status */
    toggleInterviewerStatus(id: string) {
        return api.patch(API_ROUTES.COMPANY.INTERVIEWER_TOGGLE_STATUS(id));
    },
};
