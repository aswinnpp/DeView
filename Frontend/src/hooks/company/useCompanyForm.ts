import { useState, useCallback } from "react";

const INITIAL = {
  companyName: "",
  address: "",
  contactPerson: "",
  contactEmail: "",
  contactPhone: "",
  taxId: "",
  website: "",
  numberOfEmployees: "1-10"
};

export function useCompanyForm() {
  const [form, setForm] = useState(INITIAL);

  const update = useCallback((field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
  }, []);

  return { form, update };
}
