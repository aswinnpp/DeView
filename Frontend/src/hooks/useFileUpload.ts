import { useState, useCallback } from 'react';
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

    const reset = useCallback(() => {
        setError(null);
        setUploadedFile(null);
        setIsUploading(false);
    }, []);

    const upload = async (file: File, category: UploadCategory): Promise<void> => {
        try {
            setIsUploading(true);
            setError(null);

            // Step 1: Get pre-signed upload URL from backend
            const { data: sig } = await uploadService.generateSignature(category);

            // Step 2: Upload directly to S3 using the pre-signed URL
            const res = await fetch(sig.uploadUrl, {
                method: 'PUT',
                body: file,
            });

            if (!res.ok) throw new Error('Failed to upload to S3');

            // We already know the final public URL from the backend
            setUploadedFile({ url: sig.fileUrl });
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to upload file';
            setError(msg);
        } finally {
            setIsUploading(false);
        }
    };

    return { upload, isUploading, error, uploadedFile, reset };
}
