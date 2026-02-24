import { api } from '../api/axios';

export type UploadCategory =
    | 'resume'
    | 'certificateOfIncorporation'
    | 'gstCertificate'
    | 'panCard'
    | 'addressProof'
    | 'authorizedSignatoryId'
    | 'bankDocument';

export interface IGenerateSignatureResponse {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
}

export const uploadService = {
    generateSignature(category: UploadCategory) {
        return api.post<IGenerateSignatureResponse>('/generate-signature', { category });
    },
};
