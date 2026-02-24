import { injectable } from 'inversify';
import bcrypt from 'bcrypt';
import { IPasswordHasher } from '../../application/auth/ports/services/IPasswordHasher';

@injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
    private readonly saltRounds = 10;
    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }
    async compare(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}
