import { api } from '../api/axios';

export interface UploadResponse {
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
}

export const uploadService = {
    /** Upload a single file and get back the real URL */
    uploadFile(file: File) {
        const formData = new FormData();
        formData.append('file', file);

        return api.post<UploadResponse>('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};
