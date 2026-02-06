import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { TokenServicePort, TokenPayload, RefreshTokenData } from '../../application/auth/ports/TokenServicePort.js';
import { RedisRefreshTokenRepository } from '../persistence/redis/RedisRefreshTokenRepository.js';

export class SecureJwtTokenService implements TokenServicePort {
    private refreshTokenRepo: RedisRefreshTokenRepository;

    constructor(private readonly fastify: FastifyInstance) {
        this.refreshTokenRepo = new RedisRefreshTokenRepository();
    }

    // Generate access token (15 min)
    signAccessToken(payload: TokenPayload): string {
        return this.fastify.jwt.sign(payload, { expiresIn: '15m' });
    }

    // Generate refresh token (7 days) and store in Redis
    async generateRefreshToken(userId: string): Promise<RefreshTokenData> {
        const tokenId = crypto.randomUUID();

        const token = this.fastify.jwt.sign(
            { userId, jti: tokenId },
            { expiresIn: '7d' }
        );

        // Store in Redis for revocation
        await this.refreshTokenRepo.save(userId, tokenId);

        return {
            token,
            tokenHash: tokenId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };
    }

    // Verify access token
    verifyAccessToken(token: string): TokenPayload {
        return this.fastify.jwt.verify(token) as TokenPayload;
    }

    // Verify refresh token and check Redis
    async verifyRefreshToken(token: string): Promise<{ userId: string; jti: string } | null> {
        try {
            const decoded = this.fastify.jwt.verify(token) as { userId: string; jti: string };

            // Check if token exists in Redis (not revoked)
            const exists = await this.refreshTokenRepo.exists(decoded.jti);
            if (!exists) {
                return null;
            }

            return decoded;
        } catch {
            return null;
        }
    }

    // Rotate refresh token (delete old, create new)
    async rotateRefreshToken(oldToken: string): Promise<RefreshTokenData | null> {
        const decoded = await this.verifyRefreshToken(oldToken);
        if (!decoded) {
            return null;
        }

        // Delete old token from Redis
        await this.refreshTokenRepo.delete(decoded.jti);

        // Generate new token
        return this.generateRefreshToken(decoded.userId);
    }

    // Revoke a specific refresh token (logout)
    async revokeRefreshToken(token: string): Promise<void> {
        try {
            const decoded = this.fastify.jwt.decode(token) as { jti: string } | null;
            if (decoded?.jti) {
                await this.refreshTokenRepo.delete(decoded.jti);
            }
        } catch {
            // Ignore decode errors
        }
    }


    async revokeAllUserTokens(userId: string): Promise<void> {
        await this.refreshTokenRepo.deleteAllForUser(userId);
    }
}
