import { IGenerateUploadSignatureOutputDTO } from '../../dtos/GenerateUploadSignatureDTO.js';

export interface IFileStorage {
  generateUploadSignature(
    category: string,
    userId: string
  ): Promise<IGenerateUploadSignatureOutputDTO>;
  /** Generate a fresh pre-signed GET URL for an S3 key (or full URL; key will be parsed from pathname). */
  getSignedViewUrl(s3KeyOrFullUrl: string, expiresInSeconds?: number): Promise<string>;
  getPublicUrl(storedName: string): string;
}
