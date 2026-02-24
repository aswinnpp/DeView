import { IGenerateUploadSignatureOutputDTO } from '../../dtos/GenerateUploadSignatureDTO.js';

export interface IFileStorage {
  generateUploadSignature(
    category: string,
    userId: string
  ): Promise<IGenerateUploadSignatureOutputDTO>;
  getPublicUrl(storedName: string): string;
}
