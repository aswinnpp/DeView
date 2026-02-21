import { api } from '../api/axios';
import { API_ROUTES } from '../constants/routes';
import type { CandidateProfileData as ProfileData } from '@shared/contracts/candidateProfile/profile';

// ─── Types ──────────────────────────────────────────────────────

export type ProfileResponse = { profile: ProfileData };

export type GetAllCandidatesParams = {
    search?: string;
    status?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
};

// ─── Service functions ──────────────────────────────────────────

export const candidateService = {

    getAllCandidates(params?: GetAllCandidatesParams) {
        const searchParams = new URLSearchParams();
        if (params?.search) searchParams.set('search', params.search);
        if (params?.status) searchParams.set('status', params.status);
        if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
        if (params?.page != null) searchParams.set('page', String(params.page));
        if (params?.limit != null) searchParams.set('limit', String(params.limit));
        const query = searchParams.toString();
        const url = query ? `${API_ROUTES.CANDIDATE.GETALL}?${query}` : API_ROUTES.CANDIDATE.GETALL;
        return api.get<{ data: Array<{
            id: string;
            fullName: string;
            email: string;
            isActive: boolean;
            createdAt?: string;
        }>; total: number }>(url);
    },

    toggleCandidateStatus(id: string) {
        return api.post<{ message: string; isActive: boolean }>(
            `/candidate/${id}/toggle-status`
        );
    },
    
    getProfile() {
        return api.get<ProfileResponse>(API_ROUTES.CANDIDATE.PROFILE);
    },

    createProfile(data: Partial<ProfileData>) {
        return api.post(API_ROUTES.CANDIDATE.PROFILE, data);
    },

    updateProfile(data: Partial<ProfileData>) {
        return api.patch(API_ROUTES.CANDIDATE.PROFILE, data);
    },
};
