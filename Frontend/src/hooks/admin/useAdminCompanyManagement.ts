import { useState, useCallback, useEffect } from "react";
import { adminCompanyManagementService } from "../../services/adminCompanyManagement.service";
import { extractApiError } from "../../api/axios";
import type { CompanyApproval } from "../../services/adminCompanyManagement.service";

export function useAdminCompanyManagement() {
  const [companies, setCompanies] = useState<CompanyApproval[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  // ───────── Fetch ─────────

  const fetchCompanies = useCallback(async (search?: string) => {
    setIsFetching(true);
    setError(null);
  
    try {
      const { data } = await adminCompanyManagementService.getApproved(search);
      setCompanies(data?.approvals ?? []);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setIsFetching(false);
      setInitialLoading(false);
    }
  }, []);
  

  // ───────── Toggle ─────────
  const toggleCompany = useCallback(async (companyId: string) => {
    setIsFetching(true);
  
    try {
      await adminCompanyManagementService.toggleActive(companyId);
      await fetchCompanies();
    } finally {
      setIsFetching(false);
    }
  }, [fetchCompanies]);
  

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);
  const loading = initialLoading || isFetching;

  return { loading, error,data: { companies, fetchCompanies, toggleCompany } };
}
