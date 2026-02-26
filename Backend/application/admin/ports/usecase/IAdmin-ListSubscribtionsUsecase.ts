import type { Subscribtion } from "../../../../domain/admin/entities/Subscribtion";

export interface IListSubscribtionsInput {
  search?: string;
  status?: "Active" | "Inactive";
  duration?: "Monthly" | "Quarterly" | "Annual";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface IListSubscribtionsOutput {
  data: Subscribtion[];
  total: number;
}

export interface IAdminListSubscribtionsUsecase {
  execute(input: IListSubscribtionsInput): Promise<IListSubscribtionsOutput>;
}

