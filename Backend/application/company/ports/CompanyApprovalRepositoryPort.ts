import { CompanyApproval } from "../../../domain/company/entities/CompanyApprovalEntitie";

export interface CompanyApprovalRepositoryPort {
  findByUserId(userId: string): Promise<CompanyApproval | null>;
  findById(id: string): Promise<CompanyApproval | null>;
  findPending(): Promise<CompanyApproval[]>;
  findApproved(): Promise<CompanyApproval[]>;
  searchPending(search?: string): Promise<CompanyApproval[]>;
  searchApproved(search?: string): Promise<CompanyApproval[]>;
  save(company: CompanyApproval): Promise<void>;
}
