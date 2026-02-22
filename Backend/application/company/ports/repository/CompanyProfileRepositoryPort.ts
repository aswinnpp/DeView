import { CompanyApproval } from "../../../../domain/company/entities/CompanyApprovalEntitie";

export interface CompanyProfileSearchOptions {
  search?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive';
}

export interface CompanyProfileRepositoryPort {
  findByUserId(userId: string): Promise<CompanyApproval | null>;
  findById(id: string): Promise<CompanyApproval | null>;
  findPending(options?: CompanyProfileSearchOptions): Promise<{ data: CompanyApproval[]; total: number }>;
  findApproved(options?: CompanyProfileSearchOptions): Promise<{ data: CompanyApproval[]; total: number }>;
  save(company: CompanyApproval): Promise<void>;
}
