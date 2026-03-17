import { User } from "../../../../domain/user/entities/User";
import { Email } from "../../../../domain/user/value-objects/Email";

export interface IUserSearchOptions {
  search?: string;
  status?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByCompanyIdAndRole(
    companyId: string,
    role: string,
    options?: IUserSearchOptions
  ): Promise<{ data: User[]; total: number }>;
  findByRole(
    role: string,
    options?: IUserSearchOptions
  ): Promise<{ data: User[]; total: number }>;

  /** Lightweight list of active user IDs for broadcasting notifications. */
  listActiveUserIdsByRole(role: string): Promise<string[]>;
  save(user: User): Promise<void>;
}
