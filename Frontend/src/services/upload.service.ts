import { api } from '../api/axios';

export type UploadCategory =
    | 'profilePic'
    | 'interviewerProfilePic'
    | 'hrProfilePic'
    | 'companyLogo'
    | 'resume'
    | 'certificateOfIncorporation'
    | 'gstCertificate'
    | 'panCard'
    | 'addressProof'
    | 'authorizedSignatoryId'
    | 'bankDocument';

export interface IGenerateSignatureResponse {
    uploadUrl: string;
    fileUrl: string;
    key: string;
}

export const uploadService = {
    generateSignature(category: UploadCategory) {
        return api.post<IGenerateSignatureResponse>('/generate-signature', { category });
    },
};
