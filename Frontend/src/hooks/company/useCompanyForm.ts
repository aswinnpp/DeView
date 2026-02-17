/**
 * Simple hook for company form state (name, address, contact, etc.).
 * Use when you need a controlled form that doesn't use react-hook-form.
 */
import { useState, useCallback } from "react";

const INITIAL = {
  companyName: "",
  address: "",
  contactPerson: "",
  contactPhone: "",
  taxId: "",
  website: "",
  numberOfEmployees: "1-10",
};

export function useCompanyForm() {
  const [form, setForm] = useState(INITIAL);

  /** Update a single field by name */
  const update = useCallback((field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  return { form, update };
}
