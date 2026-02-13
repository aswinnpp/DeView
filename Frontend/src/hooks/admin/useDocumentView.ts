import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import type { CompanyApproval, DocumentUpload } from "./useAdminCompanyRequests";
import { DOCUMENT_CONFIG } from "./useAdminCompanyRequests";
import { adminApprovalService } from "../../services/adminApproval.service";

type DocumentViewState = {
    company: CompanyApproval;
    documentKey: string;
};

export function useDocumentView() {
    const location = useLocation();
    const state = location.state as DocumentViewState | undefined;

    const company = state?.company ?? null;
    const documentKey = state?.documentKey ?? "";

    const document: DocumentUpload | undefined =
        company?.documents?.[documentKey];

    const documentInfo = DOCUMENT_CONFIG.find((d) => d.key === documentKey);

    const [isVerified, setIsVerified] = useState(
        () => document?.marked ?? false
    );
    const [isUpdating, setIsUpdating] = useState(false);

    const toggleVerification = useCallback(async () => {
        if (!company?.id || !documentKey) return;

        const newValue = !isVerified;
        setIsVerified(newValue); // optimistic update
        setIsUpdating(true);

        try {
            await adminApprovalService.markDocument(company.id, documentKey, newValue);
        } catch (err) {
            console.error("Failed to update document verification:", err);
            setIsVerified(!newValue); // rollback on error
        } finally {
            setIsUpdating(false);
        }
    }, [company?.id, documentKey, isVerified]);

    return {
        company,
        document,
        documentInfo,
        documentKey,
        isVerified,
        isUpdating,
        toggleVerification,
    };
}
