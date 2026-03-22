/** Admin dashboard stats — input + output in one module (same pattern as ListSubscriptionsDTO). */

export type AdminDashboardTimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type AdminDashboardGrowthItemDTO = {
  label: string;
  count: number;
  period: string;
};

export type AdminDashboardRegistrationItemDTO = {
  name: string;
  value: number;
};

export type AdminDashboardSubscriptionItemDTO = {
  name: string;
  companies: number;
};

export interface IAdminDashboardStatsInputDTO {
  period: AdminDashboardTimePeriod;
}

export interface IAdminDashboardStatsOutputDTO {
  growthData: AdminDashboardGrowthItemDTO[];
  registrationStatus: AdminDashboardRegistrationItemDTO[];
  subscriptionByPlan: AdminDashboardSubscriptionItemDTO[];
}
