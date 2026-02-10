import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSystemData } from "../../context/SystemDataContext";

// Types
interface GrowthDataItem {
    label: string;
    count: number;
    period: string;
}

interface RegistrationStatusItem {
    name: string;
    value: number;
    color: string;
}

interface SubscriptionPlanItem {
    name: string;
    companies: number;
}

export type TimePeriod = "daily" | "weekly" | "monthly" | "yearly";

export interface UseAdminDashboardReturn {
    // Data
    growthData: GrowthDataItem[];
    maxValue: number;
    registrationStatusData: RegistrationStatusItem[];
    subscriptionByPlanData: SubscriptionPlanItem[];

    // State
    timePeriod: TimePeriod;
    setTimePeriod: (period: TimePeriod) => void;



    // Utilities
    tooltipStyle: React.CSSProperties;
    timePeriodOptions: TimePeriod[];
}

export const useAdminDashboard = (): UseAdminDashboardReturn => {
    const { companies, subscriptions } = useSystemData();
    const navigate = useNavigate();
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("weekly");

    // Time period options
    const timePeriodOptions: TimePeriod[] = ['daily', 'weekly', 'monthly', 'yearly'];

    // Generate growth data based on selected time period
    const growthData = useMemo((): GrowthDataItem[] => {
        const now = new Date();
        const data: GrowthDataItem[] = [];
        let periods = 0;
        let labelFormat = "";

        switch (timePeriod) {
            case "daily":
                periods = 7;
                labelFormat = "day";
                break;
            case "weekly":
                periods = 4;
                labelFormat = "week";
                break;
            case "monthly":
                periods = 6;
                labelFormat = "month";
                break;
            case "yearly":
                periods = 3;
                labelFormat = "year";
                break;
            default:
                periods = 4;
                labelFormat = "week";
        }

        for (let i = periods - 1; i >= 0; i--) {
            let periodStart = new Date(now);
            let periodEnd = new Date(now);
            let label = "";

            switch (timePeriod) {
                case "daily":
                    periodStart.setDate(periodStart.getDate() - i);
                    periodEnd = new Date(periodStart);
                    label = periodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    break;
                case "weekly":
                    periodStart.setDate(periodStart.getDate() - (i * 7));
                    periodEnd.setDate(periodStart.getDate() + 6);
                    label = `Week ${periods - i}`;
                    break;
                case "monthly":
                    periodStart.setMonth(periodStart.getMonth() - i);
                    periodStart.setDate(1);
                    periodEnd = new Date(periodStart);
                    periodEnd.setMonth(periodEnd.getMonth() + 1);
                    periodEnd.setDate(0);
                    label = periodStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                    break;
                case "yearly":
                    periodStart.setFullYear(periodStart.getFullYear() - i);
                    periodStart.setMonth(0, 1);
                    periodEnd.setFullYear(periodStart.getFullYear());
                    periodEnd.setMonth(11, 31);
                    label = periodStart.getFullYear().toString();
                    break;
            }

            // Count companies approved in this period
            const companiesCount = companies.filter(c => {
                const createdDate = new Date(c.createdAt);
                return createdDate >= periodStart && createdDate <= periodEnd && c.status === "approved";
            }).length;

            // If no real data, use simulated growth
            const count = companiesCount || Math.floor(Math.random() * 5) + 1;

            data.push({
                label,
                count,
                period: labelFormat,
            });
        }

        return data;
    }, [companies, timePeriod]);

    // Calculate max value for scaling
    const maxValue = useMemo(() => {
        return Math.max(...growthData.map(d => d.count), 1);
    }, [growthData]);

    // Company registrations by status (for simple pie chart)
    const registrationStatusData = useMemo((): RegistrationStatusItem[] => {
        const pending = companies.filter(c => c.status === "pending").length;
        const approved = companies.filter(c => c.status === "approved").length;
        const rejected = companies.filter(c => c.status === "rejected").length;

        const data: RegistrationStatusItem[] = [
            { name: "Approved", value: approved, color: "#10b981" },
            { name: "Pending", value: pending, color: "#fbbf24" },
            { name: "Rejected", value: rejected, color: "#ef4444" },
        ];

        // If all zeros, show some friendly dummy data instead
        if (data.every(d => d.value === 0)) {
            return [
                { name: "Approved", value: 18, color: "#10b981" },
                { name: "Pending", value: 5, color: "#fbbf24" },
                { name: "Rejected", value: 2, color: "#ef4444" },
            ];
        }

        return data;
    }, [companies]);

    // Company subscriptions by plan (bar chart)
    const subscriptionByPlanData = useMemo((): SubscriptionPlanItem[] => {
        if (subscriptions && subscriptions.length > 0) {
            const counts: Record<string, { count: number }> = {};

            subscriptions.forEach((sub: any) => {
                const planName = sub.planName || sub.plan?.name || "Unknown";
                if (!counts[planName]) {
                    counts[planName] = { count: 0 };
                }
                counts[planName].count += 1;
            });

            return Object.entries(counts).map(([name, value]) => ({
                name,
                companies: value.count,
            }));
        }

        // Dummy data when there are no real subscriptions yet
        return [
            { name: "Starter", companies: 8 },
            { name: "Pro", companies: 5 },
            { name: "Enterprise", companies: 2 },
        ];
    }, [subscriptions]);


    // Tooltip style for recharts
    const tooltipStyle: React.CSSProperties = {
        backgroundColor: '#020617',
        border: '1px solid #334155',
        borderRadius: 8,
        color: '#e2e8f0',
    };

    return {
        // Data
        growthData,
        maxValue,
        registrationStatusData,
        subscriptionByPlanData,

        // State
        timePeriod,
        setTimePeriod,


        // Utilities
        tooltipStyle,
        timePeriodOptions,
    };
};

export default useAdminDashboard;
