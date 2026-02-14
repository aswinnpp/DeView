import { api } from '../api/axios';

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
};

// ─── Service functions ──────────────────────────────────────────

export const companyTeamService = {
    // ── HR ────────────────────────────────────────────────────────

    /** Fetch HR users for this company (with optional search/status) */
    listHRs(search?: string, status?: string) {
        return api.get<ListResponse>('/company/hr/list', {
            params: { search, status },
        });
    },

    /** Create a new HR account */
    createHR(data: { fullName: string; email: string }) {
        return api.post('/company/hr/create', data);
    },

    /** Toggle HR active/inactive status */
    toggleHRStatus(id: string) {
        return api.patch(`/company/hr/${id}/toggle-status`);
    },

    // ── Interviewer ──────────────────────────────────────────────

    /** Fetch Interviewer users for this company (with optional search/status) */
    listInterviewers(search?: string, status?: string) {
        return api.get<ListResponse>('/company/interviewer/list', {
            params: { search, status },
        });
    },

    /** Create a new Interviewer account */
    createInterviewer(data: { fullName: string; email: string }) {
        return api.post('/company/interviewer/create', data);
    },

    /** Toggle Interviewer active/inactive status */
    toggleInterviewerStatus(id: string) {
        return api.patch(`/company/interviewer/${id}/toggle-status`);
    },
};
