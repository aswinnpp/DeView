import { api } from '../api/axios';

export type UploadCategory =
    | 'resume'
    | 'certificateOfIncorporation'
    | 'gstCertificate'
    | 'panCard'
    | 'addressProof'
    | 'authorizedSignatoryId'
    | 'bankDocument';

export interface GenerateSignatureResponse {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
}

export const uploadService = {
    generateSignature(category: UploadCategory) {
        return api.post<GenerateSignatureResponse>('/generate-signature', { category });
    },
};
