import { useState, useCallback } from "react";
import { useFileUpload } from "../useFileUpload";
import type { UploadCategory } from "../../services/upload.service";

export type DocumentUpload = {
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  marked: boolean;
};

export function useDocuments(documentTypes: readonly { key: UploadCategory; label: string; description: string; required: boolean }[]) {
  const [documents, setDocuments] = useState<Record<string, DocumentUpload>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const uploader = useFileUpload();

  const upload = useCallback(async (key: UploadCategory, file: File) => {
    setUploading(key);
    try {
      const fileUrl = await uploader.uploadFile(key, file);
      setDocuments(prev => ({
        ...prev,
        [key]: {
          fileName: file.name,
          fileUrl,
          uploadedAt: new Date().toISOString(),
          marked: false,
        }
      }));
    } finally {
      setUploading(null);
    }
  }, [uploader]);

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

  const handleFileUpload = useCallback((key: UploadCategory, e: React.ChangeEvent<HTMLInputElement>) => {
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
