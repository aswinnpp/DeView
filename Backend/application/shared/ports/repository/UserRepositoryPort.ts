import { User } from "../../../../domain/user/entities/User";
import { Email } from "../../../../domain/user/value-objects/Email";

export interface UserSearchOptions {
  search?: string;
  status?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserRepositoryPort {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByCompanyIdAndRole(
    companyId: string,
    role: string,
    options?: Pick<UserSearchOptions, 'search' | 'status'>
  ): Promise<User[]>;
  findByRole(
    role: string,
    options?: UserSearchOptions
  ): Promise<User[]>;
  save(user: User): Promise<void>;
}
