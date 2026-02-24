import { useState } from 'react';
import { uploadService, type UploadCategory } from '../services/upload.service';

interface IFileUploadResponse {
    url: string;
}

interface IUseFileUploadReturn {
    upload: (file: File, category: UploadCategory) => Promise<void>;
    isUploading: boolean;
    error: string | null;
    uploadedFile: IFileUploadResponse | null;
    reset: () => void;
}

export function useFileUpload(): IUseFileUploadReturn {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<IFileUploadResponse | null>(null);

    const reset = () => {
        setError(null);
        setUploadedFile(null);
        setIsUploading(false);
    };

    const upload = async (file: File, category: UploadCategory): Promise<void> => {
        try {
            setIsUploading(true);
            setError(null);

            // Step 1: Get signed upload params from backend
            const { data: sig } = await uploadService.generateSignature(category);

            // Step 2: Upload directly to Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', sig.apiKey);
            formData.append('timestamp', String(sig.timestamp));
            formData.append('signature', sig.signature);
            formData.append('folder', sig.folder);

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`,
                { method: 'POST', body: formData }
            );

            if (!res.ok) throw new Error('Failed to upload to Cloudinary');

            const result = await res.json();
            setUploadedFile({ url: result.secure_url });
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to upload file';
            setError(msg);
        } finally {
            setIsUploading(false);
        }
    };

    return { upload, isUploading, error, uploadedFile, reset };
}
