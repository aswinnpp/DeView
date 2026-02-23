import { useState, useCallback, useEffect } from "react";
import { candidateService } from "../../services/candidate.service";
import { adminCompanyManagementService } from "../../services/adminCompanyManagement.service";

import { extractApiError } from "../../api/axios";
import type { GetAllCandidatesParams } from "../../services/candidate.service";

export interface CandidateListItem {
    id: string;
    fullName: string;
    email: string;
    isActive: boolean;
    createdAt?: string;
}

const DEFAULT_LIMIT = 2;

export function useAdminCandidates() {
    const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(DEFAULT_LIMIT);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const fetchCandidates = useCallback(async (params: GetAllCandidatesParams) => {
        setError(null);
        try {
            const { data } = await candidateService.getAllCandidates({
                ...params,
                limit: params.limit ?? limit,
            });
            setCandidates(data?.data ?? []);
            setTotal(data?.total ?? 0);
        } catch (err) {
            setError(extractApiError(err));
        } 
        
    }, [limit]);

    const loadPage = useCallback((p: number, search?: string, order?: 'asc' | 'desc') => {
        const opts: GetAllCandidatesParams = {
            search: (search ?? searchQuery) || undefined,
            sortOrder: order ?? sortOrder,
            page: p,
            limit,
        };
        void fetchCandidates(opts);
        setPage(p);
    }, [fetchCandidates, limit, searchQuery, sortOrder]);

    useEffect(() => {
        loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial fetch only
    }, []);

    const handleSearch = useCallback(
        (query: string, order?: 'asc' | 'desc') => {
            setSearchQuery(query);
            const ord = order ?? sortOrder;
            setSortOrder(ord);
            void loadPage(1, query || undefined, ord);
        },
        [loadPage, sortOrder]
    );

    const handleSortOrder = useCallback(
        (order: 'asc' | 'desc') => {
            setSortOrder(order);
            void loadPage(1, searchQuery || undefined, order);
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

    const toggleCandidateStatus = useCallback(async (candidateId: string) => {
        setActionLoading(candidateId);
        setError(null);
        try {
            await adminCompanyManagementService.toggleActive(candidateId);
            setCandidates(prev => prev.map(c =>
                c.id === candidateId ? { ...c, isActive: !c.isActive } : c
            ));
        } catch (err) {
            setError(extractApiError(err));
            void loadPage(page);
        } finally {
            setActionLoading(null);
        }
    }, [loadPage, page]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
        candidates,
        total,
        page,
        totalPages,
        sortOrder,
        
        error,
        searchQuery,
        actionLoading,
        handleSearch,
        handleSortOrder,
        goToPage,
        toggleCandidateStatus,
    };
}
