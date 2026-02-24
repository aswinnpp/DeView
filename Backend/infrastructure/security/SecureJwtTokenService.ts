import crypto from "crypto";
import jwt from "jsonwebtoken";

import {
  ITokenService,
  ITokenPayload,
  IRefreshTokenData,
  IRefreshTokenPayload,
} from "../../application/auth/ports/services/ITokenService";

import { RedisRefreshTokenRepository } from "../persistence/redis/RedisRefreshTokenRepository";
import { RedisAccessTokenRepository } from "../persistence/redis/RedisAccessTokenRepository";

export class SecureJwtTokenService implements ITokenService {
  constructor(
    private refreshRepo: RedisRefreshTokenRepository,
    private accessRepo: RedisAccessTokenRepository,
    private accessSecret: string,
    private refreshSecret: string
  ) {}

  // ================= ACCESS TOKEN =================

  async signAccessToken(payload: ITokenPayload): Promise<string> {
    const jti = crypto.randomUUID();

    const token = jwt.sign(
      { ...payload, jti },
      this.accessSecret,
      { expiresIn: "15m" }
    );

    await this.accessRepo.save(jti, payload.userId);

    return token;
  }

  verifyAccessToken(token: string): ITokenPayload {
    return jwt.verify(token, this.accessSecret) as ITokenPayload;
  }

  // ================= REFRESH TOKEN =================

  async generateRefreshToken(userId: string): Promise<IRefreshTokenData> {
    const tokenId = crypto.randomUUID();

    const token = jwt.sign(
      { userId, jti: tokenId },
      this.refreshSecret,
      { expiresIn: "7d" }
    );

    await this.refreshRepo.save(userId, tokenId);

    return {
      token,
      tokenHash: tokenId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
  }

  async verifyRefreshToken(token: string): Promise<IRefreshTokenPayload | null> {
    try {
      const decoded = jwt.verify(token, this.refreshSecret) as IRefreshTokenPayload;

      const exists = await this.refreshRepo.exists(decoded.jti);
      if (!exists) return null;

      return decoded;
    } catch {
      return null;
    }
  }

  async rotateRefreshToken(oldToken: string): Promise<IRefreshTokenData | null> {
    const decoded = await this.verifyRefreshToken(oldToken);
    if (!decoded) return null;

    await this.refreshRepo.delete(decoded.jti);

    return this.generateRefreshToken(decoded.userId);
  }

  // ================= REVOKE =================

  async revokeAccessToken(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as { jti?: string } | null;
      if (decoded?.jti) {
        await this.accessRepo.delete(decoded.jti);
      }
    } catch {}
  }

  async revokeRefreshToken(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as { jti?: string } | null;
      if (decoded?.jti) {
        await this.refreshRepo.delete(decoded.jti);
      }
    } catch {}
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.accessRepo.deleteAllForUser(userId);
    await this.refreshRepo.deleteAllForUser(userId);
  }
}
