import type { IApprovedCompaniesInputDTO } from '../dtos/ApprovedCompaniesDTO.js';
import type { IPendingCompaniesInputDTO } from '../dtos/PendingCompaniesDTO.js';

export const AdminCompanyApprovalListMapper = {
  toPendingListInput(query: {
    search?: string;
    sortOrder?: 'asc' | 'desc';
    page?: string;
    limit?: string;
  }): IPendingCompaniesInputDTO {
    return {
      search: query.search,
      sortOrder: query.sortOrder,
      page: query.page,
      limit: query.limit,
    };
  },

  toApprovedListInput(query: {
    search?: string;
    status?: string;
    sortOrder?: 'asc' | 'desc';
    page?: string;
    limit?: string;
  }): IApprovedCompaniesInputDTO {
    return {
      search: query.search,
      status: query.status,
      sortOrder: query.sortOrder,
      page: query.page,
      limit: query.limit,
    };
  },
};
