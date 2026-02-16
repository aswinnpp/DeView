import { api } from '../api/axios';
import { API_ROUTES } from '../constants/routes';
import type { CandidateProfileData as ProfileData } from '@shared/contracts/candidateProfile/profile';

// ─── Types ──────────────────────────────────────────────────────

export type ProfileResponse = { profile: ProfileData };

// ─── Service functions ──────────────────────────────────────────

export const candidateService = {
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
