import { useCallback } from "react";
import type { CompanyApproval } from "../../services/adminApproval.service";

export function useCompanyReviewModal(company: CompanyApproval) {

  const getUploadedDoc = useCallback(
    (key: string) => {
      return company.documents?.[key];
    },
    [company]
  );

  const getUploadedDocsCount = useCallback(() => {
    if (!company.documents) return 0;

    return Object.keys(company.documents).length;
  }, [company]);

  const getAllUploadedDocs = useCallback(() => {
    if (!company.documents) return [];

    return Object.values(company.documents);
  }, [company]);

  return {
    getUploadedDoc,
    getUploadedDocsCount,
    getAllUploadedDocs,
  };
}
