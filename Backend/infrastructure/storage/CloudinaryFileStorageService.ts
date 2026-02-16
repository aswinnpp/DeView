import { v2 as cloudinary } from "cloudinary";
import { FileStoragePort } from "../../application/upload/ports/FileStoragePort.js";
import { GenerateUploadSignatureOutputDTO } from "../../application/upload/dtos/GenerateUploadSignatureDTO.js";
import { env } from "../config/env.js";

export class CloudinaryFileStorageService implements FileStoragePort {
  constructor() {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
  }

  async generateUploadSignature(category: string, userId: string): Promise<GenerateUploadSignatureOutputDTO> {
    // Determine folder structure based on category
    const folder = category === 'resume' 
      ? `resumes/${userId}`
      : `company-docs/${userId}/${category}`;

    // Generate timestamp (Unix timestamp in seconds)
    const timestamp = Math.round(Date.now() / 1000);

    // Parameters to sign (folder is included in signature)
    const paramsToSign: Record<string, any> = {
      timestamp,
      folder,
    };

    // Generate signature using Cloudinary's api_sign_request
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
