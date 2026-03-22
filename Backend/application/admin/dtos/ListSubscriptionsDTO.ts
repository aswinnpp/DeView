/** Admin subscription list — input + output in one module. */

import type { Subscription } from '../../../domain/entities/Subscription.js';

export interface IListSubscriptionsInputDTO {
  search?: string;
  status?: 'Active' | 'Inactive';
  duration?: 'Monthly' | 'Quarterly' | 'Annual';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface IListSubscriptionsOutputDTO {
  data: Subscription[];
  total: number;
}
