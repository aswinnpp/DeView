import { injectable } from 'inversify';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

import { IFileStorage } from '../../application/upload/ports/services/IFileStorage.js';
import { IGenerateUploadSignatureOutputDTO } from '../../application/upload/dtos/GenerateUploadSignatureDTO.js';
import { env } from '../config/env.js';

@injectable()
export class S3FileStorageService implements IFileStorage {
  private readonly s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: env.AWS_REGION,
      credentials: env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
    });
  }

  async generateUploadSignature(
    category: string,
    userId: string
  ): Promise<IGenerateUploadSignatureOutputDTO> {
    const folder =
      category === 'resume'
        ? `resumes/${userId}`
        : `company-docs/${userId}/${category}`;

    const key = `${folder}/${crypto.randomUUID()}`;

    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 60 * 5 });

    const getCommand = new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
    });

    const fileUrl = await getSignedUrl(this.s3, getCommand, { expiresIn: 60 * 5 });

    return {
      uploadUrl,
      fileUrl,
    };
  }

  
  async getSignedViewUrl(s3KeyOrFullUrl: string, expiresInSeconds = 3600): Promise<string> {
    let key = s3KeyOrFullUrl;
    if (s3KeyOrFullUrl.startsWith('http://') || s3KeyOrFullUrl.startsWith('https://')) {
      try {
        const u = new URL(s3KeyOrFullUrl);
        key = u.pathname.replace(/^\//, '');
      } catch {
        throw new Error('Invalid resume URL');
      }
    }
    if (!key.trim()) throw new Error('Missing S3 key');
    const command = new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn: expiresInSeconds });
  }

  getPublicUrl(storedName: string): string {
    if (!env.AWS_S3_BUCKET || !env.AWS_REGION) {
      throw new Error('AWS_S3_BUCKET or AWS_REGION is not configured');
    }

    return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${storedName}`;
  }
}

