import { useState, useCallback, useEffect, useTransition } from "react";
import { adminApprovalService } from "../../services/adminApproval.service";
import { extractApiError } from "../../api/axios";
import type { CompanyApproval } from "../../services/adminApproval.service";



export function useAdminCompanyRequests() {
  const [pendingCompanies, setPendingCompanies] = useState<CompanyApproval[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<CompanyApproval | null>(null);
 

  const fetchPendingCompanies = useCallback(async (search?: string) => {
    setInitialLoading(true);
    setError(null);

    try {
      const { data } = await adminApprovalService.getPending(search);
      setPendingCompanies(data ?? []);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingCompanies();
  }, [fetchPendingCompanies]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      startTransition(() => {
        fetchPendingCompanies(query || undefined);
      });
    },
    [fetchPendingCompanies]
  );

  const selectCompany = useCallback((c: CompanyApproval) => setSelectedCompany(c), []);
  const clearSelectedCompany = useCallback(() => setSelectedCompany(null), []);

 

  const handleApprove = useCallback(async (id: string) => {
    await adminApprovalService.approve(id);
    fetchPendingCompanies();
    setSelectedCompany(null);
  }, [fetchPendingCompanies]);

  const handleRejectSuccess = useCallback(() => {
    fetchPendingCompanies();
    
    setSelectedCompany(null);
  }, [fetchPendingCompanies]);





  return {
    pendingCompanies,
    initialLoading,
    isPending,
    error,
    fetchPendingCompanies,
    searchQuery,
    handleSearch,
    selectedCompany,
    selectCompany,
    clearSelectedCompany,
    handleApprove,
    handleRejectSuccess,
  
  };
}
