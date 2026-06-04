import { useEffect, useMemo, useState } from 'react';
import {
    dashboardService,
    type AdminDashboardTimePeriod,
} from '../../services/dashboard.service';
import { extractApiError } from '../../api/axios';

const TIME_PERIODS = ['daily', 'weekly', 'monthly', 'yearly'] as const;
export type TimePeriod = (typeof TIME_PERIODS)[number];

type GrowthDataItem = { label: string; count: number; period: string };
type RegistrationStatusItem = { name: string; value: number; color: string };
type SubscriptionPlanItem = { name: string; companies: number };

const REG_COLORS: Record<string, string> = {
    Approved: '#10b981',
    Pending: '#fbbf24',
    Rejected: '#ef4444',
};

export function useAdminDashboard() {
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('weekly');
    const [growthData, setGrowthData] = useState<GrowthDataItem[]>([]);
    const [registrationStatusData, setRegistrationStatusData] = useState<RegistrationStatusItem[]>([]);
    const [subscriptionByPlanData, setSubscriptionByPlanData] = useState<SubscriptionPlanItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await dashboardService.getAdminStats(timePeriod as AdminDashboardTimePeriod);
                if (cancelled) return;
                setGrowthData(data.growthData);
                setRegistrationStatusData(
                    data.registrationStatus.map((r) => ({
                        ...r,
                        color: REG_COLORS[r.name] ?? '#64748b',
                    })),
                );
                setSubscriptionByPlanData(
                    data.subscriptionByPlan.map((s) => ({
                        name: s.name,
                        companies: s.companies,
                    })),
                );
            } catch (e) {
                if (!cancelled) {
                    setError(extractApiError(e));
                    setGrowthData([]);
                    setRegistrationStatusData([]);
                    setSubscriptionByPlanData([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [timePeriod]);

    const maxValue = useMemo(() => Math.max(...growthData.map((d) => d.count), 1), [growthData]);

    /** High-contrast tooltips: Recharts inner labels ignore contentStyle.color without itemStyle/labelStyle. */
    const chartTooltip = useMemo(
        () => ({
            contentStyle: {
                backgroundColor: '#ffffff',
                border: '1px solid #1e293b',
                borderRadius: 8,
                color: '#0f172a',
            } as React.CSSProperties,
            itemStyle: { color: '#0f172a' } as React.CSSProperties,
            labelStyle: { color: '#0f172a' } as React.CSSProperties,
        }),
        [],
    );

    return {
        growthData,
        maxValue,
        registrationStatusData,
        subscriptionByPlanData,
        timePeriod,
        setTimePeriod,
        chartTooltip,
        timePeriodOptions: TIME_PERIODS,
        loading,
        error,
    };
}

export default useAdminDashboard;
