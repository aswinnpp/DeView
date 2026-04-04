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

/** A flattened subscription record with company info attached. */
export interface ISubscriptionHistoryRow {
  subscriptionId: string;
  companyName: string;
  companyId: string;
  planName: string;
  duration: string;
  price: number;
  startAt: string;
  endsAt: string;
  status: string;
  createdAt: string;
}

export interface ISubscriptionHistorySearchOptions {
  search?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  status?: 'Active' | 'Pending' | 'Expired';
}

export interface ICompanyProfileRepository {
  findByUserId(userId: string): Promise<CompanyApproval | null>;
  findById(id: string): Promise<CompanyApproval | null>;
  findPending(options?: ICompanyProfileSearchOptions): Promise<{ data: CompanyApproval[]; total: number }>;
  findApproved(options?: ICompanyProfileSearchOptions): Promise<{ data: CompanyApproval[]; total: number }>;
  save(company: CompanyApproval): Promise<void>;
  listMinimalForAdminDashboard(): Promise<ICompanyProfileDashboardRow[]>;
  listSubscriptionHistory(options?: ISubscriptionHistorySearchOptions): Promise<{ data: ISubscriptionHistoryRow[]; total: number }>;
}
