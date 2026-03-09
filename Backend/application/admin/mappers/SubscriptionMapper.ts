import { parseSearchParams } from '../../shared/utils/parseSearchParams.js';
import type { IListSubscriptionsInputDTO } from '../dtos/ListSubscriptionsDTO.js';

export interface IListSubscriptionsQuery {
  search?: string;
  status?: 'Active' | 'Inactive';
  duration?: 'Monthly' | 'Quarterly' | 'Annual';
  sortOrder?: 'asc' | 'desc';
  page?: string;
  limit?: string;
}

export const SubscriptionMapper = {
  toListInput(query: IListSubscriptionsQuery): IListSubscriptionsInputDTO {
    const { search, status, duration, sortOrder, page, limit } = query;
    const { page: parsedPage, limit: parsedLimit } = parseSearchParams({ page, limit });
    return {
      search,
      status,
      duration,
      sortOrder,
      page: parsedPage,
      limit: parsedLimit,
    };
  },
};
