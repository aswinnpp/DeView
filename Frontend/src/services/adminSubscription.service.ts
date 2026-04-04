import { api } from '../api/axios';
import { API_ROUTES } from '../constants/routes';

export interface ICreateSubscriptionRequest {
  name: string;
  price: number;
  duration: 'Monthly' | 'Quarterly' | 'Annual';
  isActive: boolean;
  interviewLimit: number;
  interviewUnlimited: boolean;
  jobPostLimit: number;
  jobUnlimited: boolean;
  hasAI: boolean;
}

export type SubscriptionPlan = ICreateSubscriptionRequest & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type GetSubscriptionsParams = {
  search?: string;
  status?: 'Active' | 'Inactive';
  duration?: 'Monthly' | 'Quarterly' | 'Annual';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};

export type SubscriptionHistoryRow = {
  subscriptionId: string;
  companyName: string;
  companyId: string;
  planName: string;
  duration: string;
  price: number;
  startAt: string;
  endsAt: string;
  status: string;
  createdAt: string;
};

export type GetSubscriptionHistoryParams = {
  search?: string;
  status?: 'Active' | 'Pending' | 'Expired';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};

export const adminSubscriptionService = {
  create(data: ICreateSubscriptionRequest) {
    return api.post(API_ROUTES.ADMIN.SUBSCRIPTION_CREATE, data);
  },

  update(id: string, data: ICreateSubscriptionRequest) {
    return api.put(API_ROUTES.ADMIN.SUBSCRIPTION_UPDATE(id), data);
  },

  list(params?: GetSubscriptionsParams) {
   
    
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.duration) searchParams.set('duration', params.duration);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    if (params?.page != null) searchParams.set('page', String(params.page));
    if (params?.limit != null) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString();
    const url = `${API_ROUTES.ADMIN.SUBSCRIPTION_LIST}?${query}`
    return api.get<{ data: SubscriptionPlan[]; total: number }>(url);
  },

  toggleActive(id: string) {
    return api.post(API_ROUTES.ADMIN.SUBSCRIPTION_TOGGLE(id));
  },

  listHistory(params?: GetSubscriptionHistoryParams) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    if (params?.page != null) searchParams.set('page', String(params.page));
    if (params?.limit != null) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString();
    const url = `${API_ROUTES.ADMIN.SUBSCRIPTION_HISTORY}?${query}`;
    return api.get<{ data: SubscriptionHistoryRow[]; total: number }>(url);
  },
};
