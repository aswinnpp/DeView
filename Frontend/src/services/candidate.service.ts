import { api } from '../api/axios';
import type { CandidateProfileData as ProfileData } from '@shared/contracts/candidateProfile/profile';

// ─── Types ──────────────────────────────────────────────────────

export type ProfileResponse = { profile: ProfileData };

// ─── Service functions ──────────────────────────────────────────

export const candidateService = {
    /** Fetch the current candidate's profile */
    getProfile() {
        return api.get<ProfileResponse>('/candidate/profile');
    },

    /** Create a new profile */
    createProfile(data: Partial<ProfileData>) {
        return api.post('/candidate/profile', data);
    },

    /** Update an existing profile */
    updateProfile(data: Partial<ProfileData>) {
        return api.patch('/candidate/profile', data);
    },

    /** Upload a resume (FormData) */
    uploadResume(file: File) {
        const formData = new FormData();
        formData.append('resume', file);
        return api.post<{ resumeUrl?: string }>('/candidate/profile/resume', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};
