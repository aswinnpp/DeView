import { useState, useCallback } from "react";

export type DocumentUpload = {
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
};

export function useDocuments(documentTypes: readonly any[]) {
  const [documents, setDocuments] = useState<Record<string, DocumentUpload>>({});
  const [uploading, setUploading] = useState<string | null>(null);

  const upload = useCallback((key: string, file: File) => {
    setUploading(key);

    setDocuments(prev => ({
      ...prev,
      [key]: {
        fileName: file.name,
        fileUrl: `fake/${Date.now()}-${file.name}`,
        uploadedAt: new Date()
      }
    }));

    setUploading(null);
  }, []);

  const remove = useCallback((key: string) => {
    setDocuments(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  }, []);

  const validateRequired = useCallback(() => {
    return documentTypes
      .filter(d => d.required && !documents[d.key])
      .map(d => d.label);
  }, [documentTypes, documents]);

  const getDocumentCount = useCallback(() => Object.keys(documents).length, [documents]);
  const getRequiredDocCount = useCallback(() => documentTypes.filter(d => d.required).length, [documentTypes]);
  const getUploadedDoc = useCallback((key: string) => documents[key], [documents]);
  const isDocUploading = useCallback((key: string) => uploading === key, [uploading]);

  const handleFileUpload = useCallback((key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(key, file);
  }, [upload]);

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
    handleFileUpload
  };
}
