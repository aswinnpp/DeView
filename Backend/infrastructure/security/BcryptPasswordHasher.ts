import { injectable } from 'inversify';
import bcrypt from 'bcrypt';
import { IPasswordHasher } from '../../application/auth/ports/services/IPasswordHasher';
import { env } from '../config/env.js';

@injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
    }
    async compare(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}
