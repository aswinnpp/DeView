import crypto from 'crypto';

export class TokenHasher {
    static hash(token: string): string {
        return crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
    }

    static generateSecureToken(): string {
        return crypto.randomBytes(64).toString('hex');
    }
}
