import { User } from "../../../../domain/user/entities/User";
import { Email } from "../../../../domain/user/value-objects/Email";

export interface UserSearchOptions {
  search?: string;
  status?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UserRepositoryPort {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByCompanyIdAndRole(
    companyId: string,
    role: string,
    options?: UserSearchOptions
  ): Promise<{ data: User[]; total: number }>;
  findByRole(
    role: string,
    options?: UserSearchOptions
  ): Promise<{ data: User[]; total: number }>;
  save(user: User): Promise<void>;
}
