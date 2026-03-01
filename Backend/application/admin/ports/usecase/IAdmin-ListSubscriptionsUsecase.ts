import type { Subscription } from "../../../../domain/admin/entities/Subscription";

export interface IListSubscriptionsInput {
  search?: string;
  status?: "Active" | "Inactive";
  duration?: "Monthly" | "Quarterly" | "Annual";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface IListSubscriptionsOutput {
  data: Subscription[];
  total: number;
}

export interface IAdminListSubscriptionsUsecase {
  execute(input: IListSubscriptionsInput): Promise<IListSubscriptionsOutput>;
}
