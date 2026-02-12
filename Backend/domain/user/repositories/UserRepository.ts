
import { User } from "../entities/User";
import { Email } from "../value-objects/Email";

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  
}
