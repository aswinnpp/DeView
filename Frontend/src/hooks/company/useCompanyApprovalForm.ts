import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companyApprovalService } from "../../services/companyApproval.service";
import { useDocumentsForForm } from "./useDocumentsForForm";
import { DOCUMENT_TYPES } from "./constants";
import { companyApprovalFormSchema, type CompanyApprovalFormValues } from "@/utils/validation/companyApproval/companyApprovalSchema";
import { extractApiError } from "../../api/axios";

const INITIAL = {
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

export function useCompanyApprovalForm({ documentTypes = DOCUMENT_TYPES }: Options = {}) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CompanyApprovalFormValues>({
    resolver: zodResolver(companyApprovalFormSchema),
    defaultValues: { ...INITIAL, documents: {} },
    mode: "onSubmit",
  });

  const docs = useDocumentsForForm<CompanyApprovalFormValues>(documentTypes, form.setValue, form.watch);

  const onSubmit = async (values: CompanyApprovalFormValues) => {
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

  return {
    loading: isSubmitting || form.formState.isSubmitting,
    error: error || null,
    form,
    docs,
    documentTypes,
    onSubmit: form.handleSubmit(onSubmit, (validationErrors) => {
      console.log('Form validation errors:', validationErrors);
      setError('Please fix the errors above before submitting.');
    }),
  };
}

export default useCompanyApprovalForm;
