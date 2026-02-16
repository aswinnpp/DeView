import { api } from '../api/axios';
import type { CandidateProfileData as ProfileData } from '@shared/contracts/candidateProfile/profile';

// ─── Types ──────────────────────────────────────────────────────

export type ProfileResponse = { profile: ProfileData };

// ─── Service functions ──────────────────────────────────────────

export const candidateService = {
    getProfile() {
        return api.get<ProfileResponse>('/candidate/profile');
    },

    createProfile(data: Partial<ProfileData>) {
        return api.post('/candidate/profile', data);
    },

    updateProfile(data: Partial<ProfileData>) {
        return api.patch('/candidate/profile', data);
    },
};
