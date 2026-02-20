import { useState, useCallback, useEffect, useRef } from "react";
import { candidateService } from "../../services/candidate.service";
import { extractApiError } from "../../api/axios";

export interface CandidateListItem {
    id: string;
    fullName: string;
    email: string;
    isActive: boolean;
    createdAt?: string;
}

export function useAdminCandidates() {
    const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
   

    const fetchCandidates = useCallback(async (search?: string,  sortOrder?: 'asc' | 'desc') => {
        // Prevent multiple simultaneous fetches
       

        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            if (sortOrder) params.append("sortOrder", sortOrder);

            const { data } = await candidateService.getAllCandidates(
                params.toString() ? `?${params.toString()}` : ""
            );
            setCandidates(data?.data ?? []);
        } catch (err) {
            setError(extractApiError(err));
        } finally {
            setLoading(false);
            
        }
    }, []);

 
  
    const handleSearch = useCallback(
        (query: string, sortOrder?: 'asc' | 'desc') => {
            setSearchQuery(query);
            void fetchCandidates(query  || undefined, sortOrder);
        },
        [fetchCandidates]
    );

    const handleSortOrder = useCallback(
        (sortOrder: 'asc' | 'desc') => {
            void fetchCandidates(searchQuery  || undefined, sortOrder);
        },
        [fetchCandidates, searchQuery]
    );

 
    const toggleCandidateStatus = useCallback(async (candidateId: string) => {
        setActionLoading(candidateId);
        setError(null);
        try {
            await candidateService.toggleCandidateStatus(candidateId);
            // Update local state optimistically - no need to refetch
            setCandidates(prev => prev.map(c => 
                c.id === candidateId ? { ...c, isActive: !c.isActive } : c
            ));
        } catch (err) {
            setError(extractApiError(err));
            // On error, refresh to get correct state
            await fetchCandidates(searchQuery  || undefined);
        } finally {
            setActionLoading(null);
        }
    }, [fetchCandidates, searchQuery]);

    return {
        candidates,
        loading,
        error,
        searchQuery,
        actionLoading,
        handleSearch,
        handleSortOrder,
        
        toggleCandidateStatus,
    };
}
