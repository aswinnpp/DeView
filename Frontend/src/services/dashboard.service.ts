import { api } from '../api/axios';
import { API_ROUTES } from '../constants/routes';

export type AdminDashboardTimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type AdminDashboardStats = {
    growthData: Array<{ label: string; count: number; period: string }>;
    registrationStatus: Array<{ name: string; value: number }>;
    subscriptionByPlan: Array<{ name: string; companies: number }>;
};

export type CompanyDashboardStats = {
    companyName: string | null;
    applicationsOverTime: Array<{ day: string; dateLabel: string; applications: number }>;
    applicationStatus: Array<{ name: string; value: number }>;
    applicationsByJob: Array<{ name: string; applications: number }>;
    monthlyInterviews: Array<{ month: string; interviews: number }>;
    interviewStatus: Array<{ name: string; value: number }>;
    weeklyInterviews: Array<{ day: string; interviews: number }>;
};

export const dashboardService = {
    getAdminStats(period: AdminDashboardTimePeriod) {
        return api
            .get<AdminDashboardStats>(API_ROUTES.ADMIN.DASHBOARD_STATS, {
                params: { period },
            })
            .then((r) => r.data);
    },

    getCompanyStats() {
        return api.get<CompanyDashboardStats>(API_ROUTES.COMPANY.DASHBOARD_STATS).then((r) => r.data);
    },
};
