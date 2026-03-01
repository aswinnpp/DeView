import { Subscription } from "../../../../domain/admin/entities/Subscription";

export interface ISubscriptionListOptions {
  search?: string;
  status?: "Active" | "Inactive";
  duration?: "Monthly" | "Quarterly" | "Annual";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ISubscriptionRepository {
  save(subscription: Subscription): Promise<void>;
  findAll(
    options?: ISubscriptionListOptions
  ): Promise<{ data: Subscription[]; total: number }>;
  findById(id: string): Promise<Subscription | null>;
}
