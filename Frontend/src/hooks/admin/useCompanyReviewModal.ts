import { useState, useCallback, useEffect } from "react";
import { adminApprovalService } from "../../services/adminApproval.service";
import {
    DOCUMENT_CONFIG,
    type CompanyApproval,
    type DocumentUpload,
} from "./useAdminCompanyRequests";

export function useCompanyReviewModal(company: CompanyApproval) {
    const [documentVerification, setDocumentVerification] = useState<
        Record<string, boolean>
    >({});

    useEffect(() => {
        const map: Record<string, boolean> = {};
        DOCUMENT_CONFIG.forEach((d) => {
            if (company.documents?.[d.key]) {
                map[d.key] = company.documents[d.key].marked ?? false;
            }
        });
        setDocumentVerification(map);
    }, [company]);

    const toggleDocVerification = useCallback(
        async (key: string) => {
            const newValue = !documentVerification[key];

            // Optimistically update local state
            setDocumentVerification((prev) => ({ ...prev, [key]: newValue }));

            try {
                // Persist to backend
                await adminApprovalService.markDocument(company.id, key, newValue);
            } catch (err) {
                // Revert on failure
                console.error("Failed to mark document:", err);
                setDocumentVerification((prev) => ({ ...prev, [key]: !newValue }));
            }
        },
        [documentVerification, company.id]
    );

    const getVerifiedCount = useCallback(
        () => Object.values(documentVerification).filter(Boolean).length,
        [documentVerification]
    );

    const getUploadedDocsCount = useCallback(
        () => DOCUMENT_CONFIG.filter((d) => !!company.documents?.[d.key]).length,
        [company]
    );

    const areAllDocsVerified = useCallback(
        () =>
            DOCUMENT_CONFIG.filter((d) => !!company.documents?.[d.key]).every(
                (d) => documentVerification[d.key]
            ),
        [company, documentVerification]
    );

    const getUploadedDoc = useCallback(
        (key: string): DocumentUpload | undefined => company.documents?.[key],
        [company]
    );

    return {
        documentConfig: DOCUMENT_CONFIG,
        documentVerification,
        toggleDocVerification,
        getVerifiedCount,
        getUploadedDocsCount,
        areAllDocsVerified,
        getUploadedDoc,
    };
}
