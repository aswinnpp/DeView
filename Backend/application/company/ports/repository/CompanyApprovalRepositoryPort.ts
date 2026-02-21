import { CompanyApproval } from "../../../../domain/company/entities/CompanyApprovalEntitie";

export interface CompanyApprovalSearchOptions {
  search?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  /** For findApproved: filter by isActive */
  status?: 'active' | 'inactive';
}

export interface CompanyApprovalRepositoryPort {
  findByUserId(userId: string): Promise<CompanyApproval | null>;
  findById(id: string): Promise<CompanyApproval | null>;
  findPending(options?: CompanyApprovalSearchOptions): Promise<{ data: CompanyApproval[]; total: number }>;
  findApproved(options?: CompanyApprovalSearchOptions): Promise<{ data: CompanyApproval[]; total: number }>;
  save(company: CompanyApproval): Promise<void>;
}
