import { api } from '../api/axios';
import { API_ROUTES } from '../constants/routes';
import type { SubscriptionPlan } from './adminSubscription.service';

export const companySubscriptionService = {
  listActive() {
    const url = `${API_ROUTES.COMPANY.SUBSCRIPTION_LIST}?status=Active`;
    return api.get<{ data: SubscriptionPlan[]; total: number }>(url);
  },

  createPaymentIntent(planId: string) {
    return api.post<{ clientSecret: string }>(API_ROUTES.COMPANY.CREATE_PAYMENT_INTENT, {
      planId,
    });
  },

  activatePendingNow(pendingId: string) {
    return api.post(API_ROUTES.COMPANY.ACTIVATE_PENDING_SUBSCRIPTION(pendingId));
  },
};

