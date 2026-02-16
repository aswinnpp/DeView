import { useCallback, useState } from 'react';
import { uploadService, type UploadCategory } from '../services/upload.service';
import { extractApiError } from '../api/axios';

type CloudinaryUploadResult = {
    secure_url?: string;
    url?: string;
};

export function useFileUpload() {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadFile = useCallback(
        async (category: UploadCategory, file: File): Promise<string> => {
            setUploading(true);
            setError(null);
            try {
                const { data: sig } = await uploadService.generateSignature(category);

                const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`;
                const formData = new FormData();
                formData.append('file', file);
                formData.append('api_key', sig.apiKey);
                formData.append('timestamp', String(sig.timestamp));
                formData.append('signature', sig.signature);
                formData.append('folder', sig.folder);

                const res = await fetch(cloudinaryUrl, { method: 'POST', body: formData });
                if (!res.ok) {
                    const text = await res.text().catch(() => '');
                    throw new Error(text || 'Cloudinary upload failed');
                }
                const json = (await res.json()) as CloudinaryUploadResult;
                const url = json.secure_url || json.url;
                if (!url) throw new Error('Cloudinary response missing URL');
                return url;
            } catch (err) {
                const msg = extractApiError(err) || (err instanceof Error ? err.message : 'Upload failed');
                setError(msg);
                throw err;
            } finally {
                setUploading(false);
            }
        },
        []
    );

    const clearError = useCallback(() => setError(null), []);

    return { uploadFile, uploading, error, clearError };
}

