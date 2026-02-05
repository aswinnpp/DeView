import { RefreshToken } from '../entities/RefreshToken';

export interface RefreshTokenRepositoryPort {
    findById(id: string): Promise<RefreshToken | null>;
    save(refreshToken: RefreshToken): Promise<RefreshToken>;
    findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
    findByUserId(userId: string): Promise<RefreshToken[]>;
    revokeAllByUserId(userId: string): Promise<void>;
    deleteExpired(): Promise<void>;
    delete(id: string): Promise<void>;
}
