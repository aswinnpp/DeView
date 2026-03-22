import { CompanyApproval } from "../../../../domain/entities/CompanyApprovalEntitie";

/** Minimal row for admin dashboard aggregation (no full domain load). */
export interface ICompanyProfileDashboardRow {
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  activePlanName: string | null;
  activeSubscriptionStatus: string | null;
}

export interface ICompanyProfileSearchOptions {
  search?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive';
}

export interface ICompanyProfileRepository {
  findByUserId(userId: string): Promise<CompanyApproval | null>;
  findById(id: string): Promise<CompanyApproval | null>;
  findPending(options?: ICompanyProfileSearchOptions): Promise<{ data: CompanyApproval[]; total: number }>;
  findApproved(options?: ICompanyProfileSearchOptions): Promise<{ data: CompanyApproval[]; total: number }>;
  save(company: CompanyApproval): Promise<void>;
  listMinimalForAdminDashboard(): Promise<ICompanyProfileDashboardRow[]>;
}
