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

    listHRs(search?: string, status?: string, page?: number, limit?: number) {
        return api.get<ListResponse>(API_ROUTES.COMPANY.HR_LIST, {
            params: { search, status, page, limit },
        });
    },

    createHR(data: { fullName: string; email: string }) {
        return api.post(API_ROUTES.COMPANY.HR_CREATE, data);
    },

    toggleHRStatus(id: string) {
        return api.patch(API_ROUTES.COMPANY.HR_TOGGLE_STATUS(id));
    },

    // ── Interviewer ──────────────────────────────────────────────

    listInterviewers(search?: string, status?: string, page?: number, limit?: number) {
        return api.get<ListResponse>(API_ROUTES.COMPANY.INTERVIEWER_LIST, {
            params: { search, status, page, limit },
        });
    },

    createInterviewer(data: { fullName: string; email: string }) {
        return api.post(API_ROUTES.COMPANY.INTERVIEWER_CREATE, data);
    },

    toggleInterviewerStatus(id: string) {
        return api.patch(API_ROUTES.COMPANY.INTERVIEWER_TOGGLE_STATUS(id));
    },
};
