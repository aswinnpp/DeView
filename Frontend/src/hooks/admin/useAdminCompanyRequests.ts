import { useState, useCallback, useEffect } from "react";
import { adminApprovalService } from "../../services/adminApproval.service";
import { extractApiError } from "../../api/axios";
import type { CompanyApproval, GetPendingParams } from "../../services/adminApproval.service";

const DEFAULT_LIMIT = 2;

export function useAdminCompanyRequests() {
  const [pendingCompanies, setPendingCompanies] = useState<CompanyApproval[]>([]);
  const [total, setTotal] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<CompanyApproval | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(DEFAULT_LIMIT);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchPendingCompanies = useCallback(async (params: GetPendingParams) => {
    setInitialLoading(true);
    setError(null);
    try {
      const { data } = await adminApprovalService.getPending({
        ...params,
        limit: params.limit ?? limit,
      });
      setPendingCompanies(data?.data ?? []);
      setTotal(data?.total ?? 0);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setInitialLoading(false);
    }
  }, [limit]);

  const loadPage = useCallback((p: number, search?: string, order?: 'asc' | 'desc') => {
    const opts: GetPendingParams = {
      search: (search ?? searchQuery) || undefined,
      sortOrder: order ?? sortOrder,
      page: p,
      limit,
    };
    fetchPendingCompanies(opts);
    setPage(p);
  }, [fetchPendingCompanies, limit, searchQuery, sortOrder]);

  useEffect(() => {
    loadPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- initial fetch only
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      loadPage(1, query || undefined);
    },
    [loadPage]
  );

  const handleSortOrder = useCallback(
    (order: 'asc' | 'desc') => {
      setSortOrder(order);
      loadPage(1, searchQuery || undefined, order);
    },
    [loadPage, searchQuery]
  );

  const goToPage = useCallback(
    (p: number) => {
      if (p < 1 || p > Math.ceil(total / limit)) return;
      loadPage(p);
    },
    [loadPage, total, limit]
  );

  const selectCompany = useCallback((c: CompanyApproval) => setSelectedCompany(c), []);
  const clearSelectedCompany = useCallback(() => setSelectedCompany(null), []);

  const handleApprove = useCallback(async (id: string) => {
    await adminApprovalService.approve(id);
    loadPage(page);
    setSelectedCompany(null);
  }, [loadPage, page]);

  const handleRejectSuccess = useCallback(() => {
    loadPage(page);
    setSelectedCompany(null);
  }, [loadPage, page]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    pendingCompanies,
    total,
    page,
    totalPages,
    sortOrder,
    initialLoading,
    error,
    searchQuery,
    handleSearch,
    handleSortOrder,
    goToPage,
    selectedCompany,
    selectCompany,
    clearSelectedCompany,
    handleApprove,
    handleRejectSuccess,
  };
}
