import { User } from '../entities/User';
import { Email } from '../value-objects/Email';

export interface UserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: Email): Promise<User | null>;
    findByRole(role: string): Promise<User[]>;
    findByCompanyId(companyId: string): Promise<User[]>;
    findByCompanyIdAndRole(companyId: string, role: string): Promise<User[]>;
    create(user: User): Promise<string>;
    update(user: User): Promise<void>;
    updatePassword(userId: string, newPasswordHash: string): Promise<User>;
    delete(id: string): Promise<void>;
}
