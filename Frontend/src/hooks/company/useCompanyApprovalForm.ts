import { useCallback, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companyApprovalService, type CompanyApprovalStatus } from "../../services/companyApproval.service";
import { DOCUMENT_TYPES } from "./constants";
import { submitCompanyApprovalRequestSchema, type SubmitCompanyApprovalRequest } from "@shared/contracts/companyApproval/submit";
import { extractApiError } from "../../api/axios";

const INITIAL: Omit<SubmitCompanyApprovalRequest, 'documents'> = {
  companyName: "",
  address: "",
  contactPerson: "",
  contactPhone: "",
  taxId: "",
  website: "",
  numberOfEmployees: "1-10",
};

type Options = {
  documentTypes?: readonly { key: string; label: string; description: string; required: boolean }[];
};

type DocumentUpload = {
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  marked: boolean;
};

export function useCompanyApprovalForm({ documentTypes = DOCUMENT_TYPES }: Options = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Get previous approval data from router state (when resubmitting after rejection)
  const previousApproval = (location.state as { previousApproval?: CompanyApprovalStatus } | null)?.previousApproval;

  // Build default values: use previous data if available, otherwise use empty initial
  const defaultValues: SubmitCompanyApprovalRequest = previousApproval
    ? {
      companyName: previousApproval.companyName || "",
      address: previousApproval.address || "",
      contactPerson: previousApproval.contactPerson || "",
      contactPhone: previousApproval.contactPhone || "",
      taxId: previousApproval.taxId || "",
      website: previousApproval.website || "",
      numberOfEmployees: previousApproval.numberOfEmployees || "1-10",
      // Only include documents that were NOT marked (verified) by admin
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

  const documents = (form.watch("documents") ?? {}) as Record<string, DocumentUpload>;

  const remove = useCallback(
    (key: string) => {
      const next = { ...documents };
      delete next[key];
      form.setValue("documents", next, { shouldValidate: true });
    },
    [documents, form]
  );

  const validateRequired = useCallback(() => {
    return documentTypes
      .filter((d) => d.required && !documents[d.key])
      .map((d) => d.label);
  }, [documentTypes, documents]);

  const getDocumentCount = useCallback(() => Object.keys(documents).length, [documents]);
  const getRequiredDocCount = useCallback(() => documentTypes.filter((d) => d.required).length, [documentTypes]);

  const onSubmit = async (values: SubmitCompanyApprovalRequest) => {
    setError("");
    setIsSubmitting(true);

    console.log("Submitting payload:", JSON.stringify(values, null, 2));

    try {
      const { data: res } = await companyApprovalService.submit(values);

      console.log(res, "res");

      if (res) navigate("/company/approval-pending");
    } catch (err: any) {
      console.log("Submit error response:", JSON.stringify(err?.response?.data, null, 2));
      setError(extractApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine which documents are "locked" (marked/verified by admin — kept from previous submission)
  const getLockedDocKeys = (): Set<string> => {
    if (!previousApproval?.documents) return new Set();
    return new Set(
      Object.entries(previousApproval.documents)
        .filter(([, doc]) => doc.marked)
        .map(([key]) => key)
    );
  };

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
    isResubmission: !!previousApproval,
    lockedDocKeys: getLockedDocKeys(),
    rejectionReason: previousApproval?.rejectionReason,
    onSubmit: form.handleSubmit(onSubmit, (validationErrors: FieldErrors<SubmitCompanyApprovalRequest>) => {
      console.log('Form validation errors:', validationErrors);
      setError('Please fix the errors above before submitting.');
    }),
  };
}

export default useCompanyApprovalForm;
