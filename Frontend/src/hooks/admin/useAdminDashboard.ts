import { useMemo, useState } from 'react';
import { useSystemData } from '../../context/SystemDataContext';

const TIME_PERIODS = ['daily', 'weekly', 'monthly', 'yearly'] as const;
export type TimePeriod = (typeof TIME_PERIODS)[number];

type GrowthDataItem = { label: string; count: number; period: string };
type RegistrationStatusItem = { name: string; value: number; color: string };
type SubscriptionPlanItem = { name: string; companies: number };

const DEFAULT_REGISTRATION_DATA: RegistrationStatusItem[] = [
  { name: 'Approved', value: 18, color: '#10b981' },
  { name: 'Pending', value: 5, color: '#fbbf24' },
  { name: 'Rejected', value: 2, color: '#ef4444' },
];

const DEFAULT_SUBSCRIPTION_DATA: SubscriptionPlanItem[] = [
  { name: 'Starter', companies: 8 },
  { name: 'Pro', companies: 5 },
  { name: 'Enterprise', companies: 2 },
];

const CHART_COLORS = {
  approved: '#10b981',
  pending: '#fbbf24',
  rejected: '#ef4444',
} as const;

export function useAdminDashboard() {
  const { companies } = useSystemData();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('weekly');

  const growthData = useMemo((): GrowthDataItem[] => {
    const now = new Date();
    const data: GrowthDataItem[] = [];
    let periods = 0;
    let labelFormat = '';

    switch (timePeriod) {
      case 'daily':
        periods = 7;
        labelFormat = 'day';
        break;
      case 'weekly':
        periods = 4;
        labelFormat = 'week';
        break;
      case 'monthly':
        periods = 6;
        labelFormat = 'month';
        break;
      case 'yearly':
        periods = 3;
        labelFormat = 'year';
        break;
      default:
        periods = 4;
        labelFormat = 'week';
    }

    for (let i = periods - 1; i >= 0; i--) {
      const periodStart = new Date(now);
      const periodEnd = new Date(now);
      let label = '';

      switch (timePeriod) {
        case 'daily':
          periodStart.setDate(periodStart.getDate() - i);
          periodEnd.setTime(periodStart.getTime());
          label = periodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          break;
        case 'weekly':
          periodStart.setDate(periodStart.getDate() - i * 7);
          periodEnd.setDate(periodStart.getDate() + 6);
          label = `Week ${periods - i}`;
          break;
        case 'monthly':
          periodStart.setMonth(periodStart.getMonth() - i);
          periodStart.setDate(1);
          periodEnd.setMonth(periodStart.getMonth() + 1);
          periodEnd.setDate(0);
          label = periodStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          break;
        case 'yearly':
          periodStart.setFullYear(periodStart.getFullYear() - i);
          periodStart.setMonth(0, 1);
          periodEnd.setFullYear(periodStart.getFullYear());
          periodEnd.setMonth(11, 31);
          label = periodStart.getFullYear().toString();
          break;
      }

      const companiesCount = companies.filter(c => {
        if (!c.createdAt) return false;
        const createdDate = new Date(c.createdAt);
        return createdDate >= periodStart && createdDate <= periodEnd && c.status === 'approved';
      }).length;

      const count = companiesCount || Math.floor(Math.random() * 5) + 1;
      data.push({ label, count, period: labelFormat });
    }

    return data;
  }, [companies, timePeriod]);

  const maxValue = useMemo(() => Math.max(...growthData.map(d => d.count), 1), [growthData]);

  const registrationStatusData = useMemo((): RegistrationStatusItem[] => {
    const pending = companies.filter(c => c.status === 'pending').length;
    const approved = companies.filter(c => c.status === 'approved').length;
    const rejected = companies.filter(c => c.status === 'rejected').length;

    const data: RegistrationStatusItem[] = [
      { name: 'Approved', value: approved, color: CHART_COLORS.approved },
      { name: 'Pending', value: pending, color: CHART_COLORS.pending },
      { name: 'Rejected', value: rejected, color: CHART_COLORS.rejected },
    ];

    if (data.every(d => d.value === 0)) return DEFAULT_REGISTRATION_DATA;
    return data;
  }, [companies]);

  // Derive subscription counts from companies (each has a subscription string)
  const subscriptionByPlanData = useMemo((): SubscriptionPlanItem[] => {
    if (companies.length === 0) return DEFAULT_SUBSCRIPTION_DATA;

    const counts: Record<string, number> = {};
    for (const company of companies) {
      const planName = company.subscription && company.subscription !== 'none' ? company.subscription : 'Free';
      counts[planName] = (counts[planName] ?? 0) + 1;
    }

    return Object.entries(counts).map(([name, companiesCount]) => ({
      name,
      companies: companiesCount,
    }));
  }, [companies]);

  const tooltipStyle: React.CSSProperties = {
    backgroundColor: '#020617',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#e2e8f0',
  };

  return {
    growthData,
    maxValue,
    registrationStatusData,
    subscriptionByPlanData,
    timePeriod,
    setTimePeriod,
    tooltipStyle,
    timePeriodOptions: TIME_PERIODS,
  };
}

export default useAdminDashboard;
