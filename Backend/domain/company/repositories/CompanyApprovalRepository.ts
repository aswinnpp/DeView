
import { CompanyApproval } from "../entities/CompanyApprovalEntitie";

export interface CompanyApprovalRepository {
  findByUserId(userId: string): Promise<CompanyApproval | null>;
  findById(id: string): Promise<CompanyApproval | null>;
  findPending(): Promise<CompanyApproval[]>;
  findApproved(): Promise<CompanyApproval[]>;
  save(company: CompanyApproval): Promise<void>;
}
