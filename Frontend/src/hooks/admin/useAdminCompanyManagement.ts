import { useState, useCallback, useEffect } from "react";
import { adminCompanyManagementService } from "../../services/adminCompanyManagement.service";
import { extractApiError } from "../../api/axios";
import type { CompanyApproval, GetApprovedParams } from "../../services/adminCompanyManagement.service";

const DEFAULT_LIMIT = 2;

export function useAdminCompanyManagement() {
  const [companies, setCompanies] = useState<CompanyApproval[]>([]);
  const [total, setTotal] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(DEFAULT_LIMIT);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchCompanies = useCallback(async (params: GetApprovedParams) => {
    setInitialLoading(true);
    setError(null);
    try {
      const { data } = await adminCompanyManagementService.getApproved({
        ...params,
        limit: params.limit ?? limit,
      });
      setCompanies(data?.approvals ?? []);
      setTotal(data?.total ?? 0);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setInitialLoading(false);
    }
  }, [limit]);

  const loadPage = useCallback((p: number, search?: string, status?: 'all' | 'active' | 'inactive', order?: 'asc' | 'desc') => {
    const opts: GetApprovedParams = {
      search: (search ?? searchQuery) || undefined,
      status: status ?? statusFilter,
      sortOrder: order ?? sortOrder,
      page: p,
      limit,
    };
    fetchCompanies(opts);
    setPage(p);
  }, [fetchCompanies, limit, searchQuery, statusFilter, sortOrder]);

  useEffect(() => {
    loadPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- initial fetch only
  }, []);

  const handleSearch = useCallback(
    (q: string) => {
      setSearchQuery(q);
      loadPage(1, q || undefined);
    },
    [loadPage]
  );

  const handleStatusFilter = useCallback(
    (status: 'all' | 'active' | 'inactive') => {
      setStatusFilter(status);
      loadPage(1, searchQuery || undefined, status);
    },
    [loadPage, searchQuery]
  );

  const handleSortOrder = useCallback(
    (order: 'asc' | 'desc') => {
      setSortOrder(order);
      loadPage(1, searchQuery || undefined, statusFilter, order);
    },
    [loadPage, searchQuery, statusFilter]
  );

  const goToPage = useCallback(
    (p: number) => {
      if (p < 1 || p > Math.ceil(total / limit)) return;
      loadPage(p);
    },
    [loadPage, total, limit]
  );

  const toggleCompany = useCallback(async (companyId: string) => {
    setInitialLoading(true);
    try {
      await adminCompanyManagementService.toggleActive(companyId);
      loadPage(page);
    } finally {
      setInitialLoading(false);
    }
  }, [loadPage, page]);

  const loading = initialLoading;
  const totalPages = Math.ceil(total / limit) || 1;
  const refetch = useCallback(() => loadPage(page), [loadPage, page]);

  return {
    loading,
    error,
    companies,
    total,
    page,
    limit,
    totalPages,
    statusFilter,
    sortOrder,
    handleSearch,
    handleStatusFilter,
    handleSortOrder,
    goToPage,
    toggleCompany,
    refetch,
  };
}
