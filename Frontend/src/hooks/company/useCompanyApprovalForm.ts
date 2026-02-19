import { useCallback, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
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
import { APP_ROUTES } from "../../constants/routes";

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

  const previousApproval = (location.state as
    | { previousApproval?: CompanyApprovalStatus }
    | null)?.previousApproval;

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

  const remove = useCallback(
    (key: string) => {
      const next = { ...documents };
      delete next[key];
      form.setValue("documents", next, { shouldValidate: true });
    },
    [documents, form]
  );


 


 const getLockedDocKeys = useCallback((): Set<string> => {
  const documents = previousApproval?.documents;

  if (!documents) return new Set();

  const keys = Object.keys(documents);
  const lockedKeys: string[] = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    if (documents[key].marked) {
      lockedKeys.push(key);
    }
  }

  return new Set(lockedKeys);
}, [previousApproval?.documents]);

  const lockedDocKeys = getLockedDocKeys();

  // Prevent duplicate submission: if user already has pending approval, redirect
  useEffect(() => {
    if (previousApproval) return; // Resubmission flow - no check needed
    let cancelled = false;

    (async () => {
      try {
        const res = await companyApprovalService.getMyApproval();
        const approval = res.data;
        if (cancelled || !approval) return;
        if (approval.status === "pending") {
          navigate(APP_ROUTES.COMPANY_APPROVAL_PENDING, { replace: true });
        } else if (approval.status === "approved") {
          navigate(APP_ROUTES.COMPANY_DASHBOARD, { replace: true });
        }
      } catch (err){
         setError(extractApiError(err));
      }
    })();

    return () => { cancelled = true; };
  }, [previousApproval, navigate]);

  const onSubmit = async (values: SubmitCompanyApprovalRequest) => {
    setError("");
    setIsSubmitting(true);
    try {
      await companyApprovalService.submit(values);
      navigate(APP_ROUTES.COMPANY_APPROVAL_PENDING);
    } catch (err: unknown) {
      setError(extractApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };


  return {
    loading: isSubmitting || form.formState.isSubmitting,
    error: error || null,
    form,
    documents,
    remove,
    documentTypes,
    isResubmission: Boolean(previousApproval),
    lockedDocKeys,
    rejectionReason: previousApproval?.rejectionReason,
    onSubmit
  };
}

export default useCompanyApprovalForm;
