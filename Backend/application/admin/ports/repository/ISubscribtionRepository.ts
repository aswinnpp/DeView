import { Subscribtion } from "../../../../domain/admin/entities/Subscribtion";

export interface ISubscribtionListOptions {
  search?: string;
  status?: "Active" | "Inactive";
  duration?: "Monthly" | "Quarterly" | "Annual";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ISubscribtionRepository {
  save(subscribtion: Subscribtion): Promise<void>;
  findAll(
    options?: ISubscribtionListOptions
  ): Promise<{ data: Subscribtion[]; total: number }>;
  findById(id: string): Promise<Subscribtion | null>;
}

