import { useState, useEffect, useCallback } from 'react';
import {
  adminSubscriptionService,
  type SubscriptionHistoryRow,
  type GetSubscriptionHistoryParams,
} from '../../services/adminSubscription.service';

const LIMIT = 10;

export function useAdminSubscriptionHistory() {
  const [rows, setRows] = useState<SubscriptionHistoryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<GetSubscriptionHistoryParams['status']>();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await adminSubscriptionService.listHistory({
        search: search || undefined,
        status,
        sortOrder,
        page,
        limit: LIMIT,
      });
      const payload = (res as unknown as { data: { data: SubscriptionHistoryRow[]; total: number } }).data;
      setRows(payload.data ?? []);
      setTotal(payload.total ?? 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load subscription history';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [search, status, sortOrder, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = useCallback((q: string) => {
    setSearch(q);
    setPage(1);
  }, []);

  const handleStatusFilter = useCallback((s: GetSubscriptionHistoryParams['status']) => {
    setStatus(s);
    setPage(1);
  }, []);

  const handleSortOrder = useCallback((s: 'asc' | 'desc') => {
    setSortOrder(s);
    setPage(1);
  }, []);

  const goToPage = useCallback((p: number) => {
    setPage(p);
  }, []);

  return {
    rows,
    total,
    page,
    totalPages,
    search,
    status,
    sortOrder,
    isLoading,
    error,
    handleSearch,
    handleStatusFilter,
    handleSortOrder,
    goToPage,
  };
}
