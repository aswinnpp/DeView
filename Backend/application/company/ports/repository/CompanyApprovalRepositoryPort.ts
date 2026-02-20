import { CompanyApproval } from "../../../../domain/company/entities/CompanyApprovalEntitie";

export interface CompanyApprovalSearchOptions {
  search?: string;
}

export interface CompanyApprovalRepositoryPort {
  findByUserId(userId: string): Promise<CompanyApproval | null>;
  findById(id: string): Promise<CompanyApproval | null>;
  findPending(options?: CompanyApprovalSearchOptions): Promise<CompanyApproval[]>;
  findApproved(options?: CompanyApprovalSearchOptions): Promise<CompanyApproval[]>;
  save(company: CompanyApproval): Promise<void>;
}
