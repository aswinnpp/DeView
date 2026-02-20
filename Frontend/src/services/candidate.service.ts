import { api } from '../api/axios';
import { API_ROUTES } from '../constants/routes';
import type { CandidateProfileData as ProfileData } from '@shared/contracts/candidateProfile/profile';

// ─── Types ──────────────────────────────────────────────────────

export type ProfileResponse = { profile: ProfileData };

// ─── Service functions ──────────────────────────────────────────

export const candidateService = {

    getAllCandidates(queryParams?: string) {
        const url = queryParams 
            ? `${API_ROUTES.CANDIDATE.GETALL}${queryParams}`
            : API_ROUTES.CANDIDATE.GETALL;
        return api.get<{ data: Array<{
            id: string;
            fullName: string;
            email: string;
            isActive: boolean;
            createdAt?: string;
        }> }>(url);
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
