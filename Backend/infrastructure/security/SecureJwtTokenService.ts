import { FastifyInstance } from 'fastify';
import { TokenServicePort, TokenPayload, RefreshTokenData } from '../../application/auth/ports/TokenServicePort';
import { RefreshTokenRepositoryPort } from '../../domain/auth/repositories/RefreshTokenRepositoryPort';
import { RefreshToken } from '../../domain/auth/entities/RefreshToken';
import { TokenHasher } from './TokenHasher';

export class SecureJwtTokenService implements TokenServicePort {
    private readonly REFRESH_TOKEN_TTL_DAYS = 7;

    constructor(
        private readonly fastify: FastifyInstance,
        private readonly refreshTokenRepository: RefreshTokenRepositoryPort
    ) { }

    signAccessToken(payload: TokenPayload): string {
        return this.fastify.jwt.sign(payload, { expiresIn: '15m' });
    }

    async generateRefreshToken(userId: string, deviceInfo: string): Promise<RefreshTokenData> {
        const token = TokenHasher.generateSecureToken();
        const tokenHash = TokenHasher.hash(token);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_TTL_DAYS);

        const refreshToken = RefreshToken.create({
            userId,
            tokenHash,
            deviceInfo,
            expiresAt,
        });

        await this.refreshTokenRepository.save(refreshToken);

        return {
            token,
            tokenHash,
            expiresAt,
        };
    }

    verifyAccessToken(token: string): TokenPayload {
        return this.fastify.jwt.verify(token) as TokenPayload;
    }

    async rotateRefreshToken(oldTokenHash: string, deviceInfo: string): Promise<RefreshTokenData | null> {
        const existingToken = await this.refreshTokenRepository.findByTokenHash(oldTokenHash);

        if (!existingToken || !existingToken.isValid()) {
            if (existingToken && !existingToken.revoked) {
                await this.revokeAllUserTokens(existingToken.userId);
            }
            return null;
        }

        await this.refreshTokenRepository.delete(existingToken.id!);

        return this.generateRefreshToken(existingToken.userId, deviceInfo);
    }

    async revokeRefreshToken(tokenHash: string): Promise<void> {
        const token = await this.refreshTokenRepository.findByTokenHash(tokenHash);
        if (token) {
            token.revoke();
            await this.refreshTokenRepository.save(token);
        }
    }

    async revokeAllUserTokens(userId: string): Promise<void> {
        await this.refreshTokenRepository.revokeAllByUserId(userId);
    }
}
