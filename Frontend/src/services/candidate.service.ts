import { api } from '../api/axios';
import type { CandidateProfileData as ProfileData } from '@shared/contracts/candidateProfile/profile';

// ─── Types ──────────────────────────────────────────────────────

export type ProfileResponse = { profile: ProfileData };

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.includes(',') ? result.split(',')[1]! : result;
            resolve(base64);
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

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

    async uploadResume(file: File) {
        const fileBase64 = await fileToBase64(file);
        return api.post<{ resumeUrl?: string }>('/candidate/profile/resume', {
            fileName: file.name,
            mimetype: file.type || 'application/pdf',
            fileBase64,
        });
    },
};
