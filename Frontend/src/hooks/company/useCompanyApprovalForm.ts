import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApi } from "../useApi";
import { useDocumentsForForm } from "./useDocumentsForForm";
import { DOCUMENT_TYPES } from "./constants";
import { companyApprovalFormSchema, type CompanyApprovalFormValues } from "@/utils/validation/companyApproval/companyApprovalSchema";

const INITIAL = {
  companyName: "",
  address: "",
  contactPerson: "",
  contactEmail: "",
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
  const { execute, error: apiError } = useApi<{ message?: string }>("/company/submit", "POST");

  const form = useForm<CompanyApprovalFormValues>({
    resolver: zodResolver(companyApprovalFormSchema),
    defaultValues: { ...INITIAL, documents: {} },
    mode: "onSubmit",
  });

  const docs = useDocumentsForForm<CompanyApprovalFormValues>(documentTypes, form.setValue, form.watch);

  const onSubmit: SubmitHandler<CompanyApprovalFormValues> = async (values) => {
    setError("");
    const res = await execute({ data: values });
    if (res) navigate("/company/approval-pending");
  };

  return {
    loading: form.formState.isSubmitting,
    error: error || apiError || null,
    form,
    docs,
    documentTypes,
    submit: form.handleSubmit(onSubmit),
  };
}

export default useCompanyApprovalForm;
