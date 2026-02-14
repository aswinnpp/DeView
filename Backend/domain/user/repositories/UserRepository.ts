
import { User } from "../entities/User";
import { Email } from "../value-objects/Email";

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByCompanyIdAndRole(companyId: string, role: string): Promise<User[]>;
  searchByCompanyIdAndRole(companyId: string, role: string, search?: string, status?: string): Promise<User[]>;
  save(user: User): Promise<void>;

}
