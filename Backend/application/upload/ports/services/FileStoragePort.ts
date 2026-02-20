import { GenerateUploadSignatureOutputDTO } from '../../dtos/GenerateUploadSignatureDTO.js';

export interface FileStoragePort {
    generateUploadSignature(category: string, userId: string): Promise<GenerateUploadSignatureOutputDTO>;
    getPublicUrl(storedName: string): string;
}
