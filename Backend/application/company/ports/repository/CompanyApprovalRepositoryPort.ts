import { CompanyApproval } from "../../../../domain/company/entities/CompanyApprovalEntitie";

export interface CompanyApprovalRepositoryPort {
  findByUserId(userId: string): Promise<CompanyApproval | null>;
  findById(id: string): Promise<CompanyApproval | null>;
  findPending(search?: string): Promise<CompanyApproval[]>;
  findApproved(search?: string): Promise<CompanyApproval[]>;
  save(company: CompanyApproval): Promise<void>;
}
