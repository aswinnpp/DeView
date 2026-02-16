import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "crypto";
import path from "path";
import { FileStoragePort } from "../../application/upload/ports/FileStoragePort.js";
import { env } from "../config/env.js";

export class CloudinaryFileStorageService implements FileStoragePort {
  constructor() {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
  }

  async save(originalName: string, data: Buffer): Promise<string> {
    const ext = path.extname(originalName); // ".pdf"
    const publicId = `${randomUUID()}${ext}`;
  
    const result = await new Promise<{ public_id: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "image", // PDF preview support
          folder: "resumes",
          public_id: publicId,
        },
        (err, res) => {
          if (err) return reject(err);
          console.log("UPLOAD RESULT:", res?.public_id);
          resolve({ public_id: res!.public_id });
        }
      ).end(data);
    });
  
    return result.public_id; // resumes/<uuid>.pdf
  }
  
  
  

  getPublicUrl(publicId: string) {
    return cloudinary.url(publicId, {
      secure: true,
    });
  }
  
  
}
