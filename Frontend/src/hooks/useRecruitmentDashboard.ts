import { useCallback, useEffect, useState } from 'react';
import {
    dashboardService,
    type CompanyDashboardStats,
} from '../services/dashboard.service';
import { extractApiError } from '../api/axios';

export function useRecruitmentDashboard() {
    const [stats, setStats] = useState<CompanyDashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await dashboardService.getCompanyStats();
            setStats(data);
        } catch (e) {
            setError(extractApiError(e));
            setStats(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refetch();
    }, [refetch]);

    return { stats, loading, error, refetch };
}
