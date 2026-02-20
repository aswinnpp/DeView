import { injectable } from 'inversify';
import { v2 as cloudinary } from "cloudinary";
import { FileStoragePort } from "../../application/upload/ports/FileStoragePort.js";

import { GenerateUploadSignatureOutputDTO } from "../../application/upload/dtos/GenerateUploadSignatureDTO.js";
import { env } from "../config/env.js";

@injectable()
export class CloudinaryFileStorageService implements FileStoragePort {
  constructor() {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
  }

  async generateUploadSignature(category: string, userId: string): Promise<GenerateUploadSignatureOutputDTO> {
    const folder = category === 'resume' 
      ? `resumes/${userId}`
      : `company-docs/${userId}/${category}`;

    const timestamp = Math.round(Date.now() / 1000);

    const paramsToSign: Record<string, any> = {
      timestamp,
      folder,
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, env.CLOUDINARY_API_SECRET!);

    return {
      signature,
      timestamp,
      apiKey: env.CLOUDINARY_API_KEY!,
      cloudName: env.CLOUDINARY_CLOUD_NAME!,
      folder,
    };
  }

  getPublicUrl(publicId: string) {
    return cloudinary.url(publicId, {
      secure: true,
    });
  }
}
