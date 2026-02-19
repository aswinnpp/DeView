import { useState, useCallback, useEffect } from "react";
import { adminCompanyManagementService } from "../../services/adminCompanyManagement.service";
import { extractApiError } from "../../api/axios";
import type { CompanyApproval } from "../../services/adminCompanyManagement.service";

export function useAdminCompanyManagement() {
  const [companies, setCompanies] = useState<CompanyApproval[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ───────── Fetch ─────────

  const fetchCompanies = useCallback(async (search?: string) => {
    setInitialLoading(true);
    setError(null);
  
    try {
      const { data } = await adminCompanyManagementService.getApproved(search);
      setCompanies(data?.approvals ?? []);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setInitialLoading(false);
     
    }
  }, []);
  

  // ───────── Toggle ─────────
  const toggleCompany = useCallback(async (companyId: string) => {
    setInitialLoading(true);
  
    try {
      await adminCompanyManagementService.toggleActive(companyId);
      await fetchCompanies();
    } finally {
      setInitialLoading(false);
    }
  }, [fetchCompanies]);
  

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);
  const loading = initialLoading

  return { loading, error,data: { companies, fetchCompanies, toggleCompany } };
}
