/**
 * Hook for the company approval / onboarding form.
 * Handles form state, document uploads, validation, and submit.
 * Supports resubmission: if user was rejected, previous data can be pre-filled from router state.
 */
import { useCallback, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  companyApprovalService,
  type CompanyApprovalStatus,
} from "../../services/companyApproval.service";
import { DOCUMENT_TYPES } from "./constants";
import {
  submitCompanyApprovalRequestSchema,
  type SubmitCompanyApprovalRequest,
} from "@shared/contracts/companyApproval/submit";
import { extractApiError } from "../../api/axios";

// Default form values when not resubmitting
const INITIAL: Omit<SubmitCompanyApprovalRequest, "documents"> = {
  companyName: "",
  address: "",
  contactPerson: "",
  contactPhone: "",
  taxId: "",
  website: "",
  numberOfEmployees: "1-10",
};

type DocumentUpload = {
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  marked: boolean;
};

type Options = {
  documentTypes?: readonly {
    key: string;
    label: string;
    description: string;
    required: boolean;
  }[];
};

export function useCompanyApprovalForm({
  documentTypes = DOCUMENT_TYPES,
}: Options = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When user resubmits after rejection, we get previous data from router state
  const previousApproval = (location.state as
    | { previousApproval?: CompanyApprovalStatus }
    | null)?.previousApproval;

  // Start with previous data if resubmitting, otherwise empty form
  const defaultValues: SubmitCompanyApprovalRequest = previousApproval
    ? {
        companyName: previousApproval.companyName ?? "",
        address: previousApproval.address ?? "",
        contactPerson: previousApproval.contactPerson ?? "",
        contactPhone: previousApproval.contactPhone ?? "",
        taxId: previousApproval.taxId ?? "",
        website: previousApproval.website ?? "",
        numberOfEmployees: previousApproval.numberOfEmployees ?? "1-10",
        // Only keep documents that were marked (verified) by admin
        documents: previousApproval.documents
          ? Object.fromEntries(
              Object.entries(previousApproval.documents).filter(
                ([, doc]) => doc.marked
              )
            )
          : {},
      }
    : { ...INITIAL, documents: {} };

  const form = useForm<SubmitCompanyApprovalRequest>({
    resolver: zodResolver(submitCompanyApprovalRequestSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const documents = (form.watch("documents") ?? {}) as Record<
    string,
    DocumentUpload
  >;

  // Remove an uploaded document by key
  const remove = useCallback(
    (key: string) => {
      const next = { ...documents };
      delete next[key];
      form.setValue("documents", next, { shouldValidate: true });
    },
    [documents, form]
  );

  // Returns labels of required document types that are still missing
  const validateRequired = useCallback(() => {
    return documentTypes
      .filter((d) => d.required && !documents[d.key])
      .map((d) => d.label);
  }, [documentTypes, documents]);

  const getDocumentCount = useCallback(
    () => Object.keys(documents).length,
    [documents]
  );
  const getRequiredDocCount = useCallback(
    () => documentTypes.filter((d) => d.required).length,
    [documentTypes]
  );

  // Document keys that were verified by admin (user cannot remove them on resubmit)
  const getLockedDocKeys = useCallback((): Set<string> => {
    if (!previousApproval?.documents) return new Set();
    return new Set(
      Object.entries(previousApproval.documents)
        .filter(([, doc]) => doc.marked)
        .map(([key]) => key)
    );
  }, [previousApproval?.documents]);

  const lockedDocKeys = getLockedDocKeys();

  const onSubmit = async (values: SubmitCompanyApprovalRequest) => {
    setError("");
    setIsSubmitting(true);
    try {
      await companyApprovalService.submit(values);
      navigate("/company/approval-pending");
    } catch (err: unknown) {
      setError(extractApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = form.handleSubmit(
    onSubmit,
    (validationErrors: FieldErrors<SubmitCompanyApprovalRequest>) => {
      setError("Please fix the errors above before submitting.");
    }
  );

  return {
    loading: isSubmitting || form.formState.isSubmitting,
    error: error || null,
    form,
    documents,
    remove,
    documentTypes,
    validateRequired,
    getDocumentCount,
    getRequiredDocCount,
    isResubmission: Boolean(previousApproval),
    lockedDocKeys,
    rejectionReason: previousApproval?.rejectionReason,
    onSubmit: handleSubmit,
  };
}

export default useCompanyApprovalForm;
