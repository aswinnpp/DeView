import type { CompanyApproval } from '../../../domain/entities/CompanyApprovalEntitie.js';

export interface IPendingCompaniesInputDTO {
  search?: string;
  sortOrder?: 'asc' | 'desc';
  page?: string;
  limit?: string;
}

export interface IPendingCompaniesOutputDTO {
  data: CompanyApproval[];
  total: number;
}
