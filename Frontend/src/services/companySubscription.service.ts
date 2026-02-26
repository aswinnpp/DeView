import { api } from '../api/axios';
import { API_ROUTES } from '../constants/routes';
import type { SubscriptionPlan } from './adminSubscription.service';

export const companySubscriptionService = {
  listActive() {
    const url = `${API_ROUTES.COMPANY.SUBSCRIPTION_LIST}?status=Active`;
    return api.get<{ data: SubscriptionPlan[]; total: number }>(url);
  },
};

