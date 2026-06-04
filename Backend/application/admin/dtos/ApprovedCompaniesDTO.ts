import type { CompanyApproval } from '../../../domain/entities/CompanyApprovalEntitie.js';

export interface IApprovedCompaniesInputDTO {
  search?: string;
  status?: string;
  sortOrder?: 'asc' | 'desc';
  page?: string;
  limit?: string;
}

export interface IApprovedCompaniesOutputDTO {
  approvals: CompanyApproval[];
  total: number;
}
