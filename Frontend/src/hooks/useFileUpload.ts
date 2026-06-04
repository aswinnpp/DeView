import { useState, useCallback } from 'react';
import { uploadService, type UploadCategory } from '../services/upload.service';

interface IFileUploadResponse {
    url: string;
    key: string;
}

interface IUseFileUploadReturn {
    upload: (file: File, category: UploadCategory) => Promise<IFileUploadResponse | null>;
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

    const upload = async (file: File, category: UploadCategory): Promise<IFileUploadResponse | null> => {
        try {
            setIsUploading(true);
            setError(null);

            const { data: sig } = await uploadService.generateSignature(category);

            const res = await fetch(sig.uploadUrl, {
                method: 'PUT',
                body: file,
            });

            if (!res.ok) throw new Error('Failed to upload to S3');

            const out = { url: sig.fileUrl, key: sig.key };
            setUploadedFile(out);
            return out;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to upload file';
            setError(msg);
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    return { upload, isUploading, error, uploadedFile, reset };
}
