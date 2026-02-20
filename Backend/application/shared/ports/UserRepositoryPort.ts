import { User } from "../../../domain/user/entities/User";
import { Email } from "../../../domain/user/value-objects/Email";

export interface UserRepositoryPort {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByCompanyIdAndRole(companyId: string, role: string): Promise<User[]>;
  searchByCompanyIdAndRole(companyId: string, role: string, search?: string, status?: string): Promise<User[]>;
  findByRole(role: string): Promise<User[]>;
  searchByRole(role: string, search?: string, status?: string, sortOrder?: 'asc' | 'desc'): Promise<User[]>;
  save(user: User): Promise<void>;
}
