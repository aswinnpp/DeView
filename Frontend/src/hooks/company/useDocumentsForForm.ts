import { useState, useCallback } from "react";
import type { UseFormSetValue, UseFormWatch, Path, PathValue } from "react-hook-form";
import { useFileUpload } from "../useFileUpload";
import type { UploadCategory } from "../../services/upload.service";

export type DocumentUpload = {
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  marked: boolean;
};

type FormWithDocuments = { documents?: Record<string, DocumentUpload> };

export function useDocumentsForForm<T extends FormWithDocuments>(
  documentTypes: readonly { key: UploadCategory; label: string; description: string; required: boolean }[],
  setValue: UseFormSetValue<T>,
  watch: UseFormWatch<T>
) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const documents = (watch("documents" as Path<T>) ?? {}) as Record<string, DocumentUpload>;
  const uploader = useFileUpload();

  const upload = useCallback(
    async (key: string, file: File) => {
      setUploading(key);
      setUploadError(null);

      try {
        // key is the Cloudinary upload category for company docs
        const fileUrl = await uploader.uploadFile(key as UploadCategory, file);

        const doc: DocumentUpload = {
          fileName: file.name,
          fileUrl,
          uploadedAt: new Date().toISOString(),
          marked: false,
        };
        setValue("documents" as Path<T>, { ...documents, [key]: doc } as PathValue<T, Path<T>>, { shouldValidate: true });
      } catch (err) {
        console.error('File upload failed:', err);
        setUploadError(`Failed to upload ${file.name}`);
      } finally {
        setUploading(null);
      }
    },
    [documents, setValue, uploader]
  );

  const remove = useCallback(
    (key: string) => {
      const next = { ...documents };
      delete next[key];
      setValue("documents" as Path<T>, next as PathValue<T, Path<T>>, { shouldValidate: true });
    },
    [documents, setValue]
  );

  const validateRequired = useCallback(() => {
    return documentTypes
      .filter((d) => d.required && !documents[d.key])
      .map((d) => d.label);
  }, [documentTypes, documents]);

  const getDocumentCount = useCallback(() => Object.keys(documents).length, [documents]);
  const getRequiredDocCount = useCallback(
    () => documentTypes.filter((d) => d.required).length,
    [documentTypes]
  );
  const getUploadedDoc = useCallback(
    (key: string) => documents[key],
    [documents]
  );
  const isDocUploading = useCallback((key: string) => uploading === key, [uploading]);

  const handleFileUpload = useCallback(
    (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) upload(key, file);
    },
    [upload]
  );

  return {
    documents,
    upload,
    remove,
    uploading,
    uploadError,
    validateRequired,
    getDocumentCount,
    getRequiredDocCount,
    getUploadedDoc,
    isDocUploading,
    handleFileUpload,
  };
}
