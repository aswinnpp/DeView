import { useState, useCallback } from "react";
import type { UseFormSetValue, UseFormWatch } from "react-hook-form";

export type DocumentUpload = {
  fileName: string;
  fileUrl: string;
  uploadedAt: Date | string;
};

type FormWithDocuments = { documents?: Record<string, DocumentUpload> };

export function useDocumentsForForm<T extends FormWithDocuments>(
  documentTypes: readonly { key: string; label: string; description: string; required: boolean }[],
  setValue: UseFormSetValue<T>,
  watch: UseFormWatch<T>
) {
  const [uploading, setUploading] = useState<string | null>(null);
  const documents = watch("documents") ?? {};

  const upload = useCallback(
    (key: string, file: File) => {
      setUploading(key);
      const doc: DocumentUpload = {
        fileName: file.name,
        fileUrl: `fake/${Date.now()}-${file.name}`,
        uploadedAt: new Date(),
      };
      setValue("documents", { ...documents, [key]: doc }, { shouldValidate: true });
      setUploading(null);
    },
    [documents, setValue]
  );

  const remove = useCallback(
    (key: string) => {
      const next = { ...documents };
      delete next[key];
      setValue("documents", next, { shouldValidate: true });
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
    validateRequired,
    getDocumentCount,
    getRequiredDocCount,
    getUploadedDoc,
    isDocUploading,
    handleFileUpload,
  };
}
