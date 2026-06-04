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
    private _refreshRepo: RedisRefreshTokenRepository,
    private _accessRepo: RedisAccessTokenRepository,
    private _accessSecret: string,
    private _refreshSecret: string,
    private _accessTtl: string,
    private _refreshTtl: string,
    private _refreshTtlMs: number
  ) {}

  // ================= ACCESS TOKEN =================

  async signAccessToken(payload: ITokenPayload): Promise<string> {
    const jti = crypto.randomUUID();

    const token = jwt.sign(
      { ...payload, jti },
      this._accessSecret,
      { expiresIn: this._accessTtl as jwt.SignOptions["expiresIn"] }
    );

    await this._accessRepo.save(jti, payload.userId);

    return token;
  }

  verifyAccessToken(token: string): ITokenPayload {
    return jwt.verify(token, this._accessSecret) as ITokenPayload;
  }

  // ================= REFRESH TOKEN =================

  async generateRefreshToken(userId: string): Promise<IRefreshTokenData> {
    const tokenId = crypto.randomUUID();

    const token = jwt.sign(
      { userId, jti: tokenId },
      this._refreshSecret,
      { expiresIn: this._refreshTtl as jwt.SignOptions["expiresIn"] }
    );

    await this._refreshRepo.save(userId, tokenId);

    return {
      token,
      tokenHash: tokenId,
      expiresAt: new Date(Date.now() + this._refreshTtlMs),
    };
  }

  async verifyRefreshToken(token: string): Promise<IRefreshTokenPayload | null> {
    try {
      const decoded = jwt.verify(token, this._refreshSecret) as IRefreshTokenPayload;

      const exists = await this._refreshRepo.exists(decoded.jti);
      if (!exists) return null;

      return decoded;
    } catch {
      return null;
    }
  }

  async rotateRefreshToken(oldToken: string): Promise<IRefreshTokenData | null> {
    const decoded = await this.verifyRefreshToken(oldToken);
    if (!decoded) return null;

    await this._refreshRepo.delete(decoded.jti);

    return this.generateRefreshToken(decoded.userId);
  }

  // ================= REVOKE =================

  async revokeAccessToken(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as { jti?: string } | null;
      if (decoded?.jti) {
        await this._accessRepo.delete(decoded.jti);
      }
    } catch {}
  }

  async revokeRefreshToken(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as { jti?: string } | null;
      if (decoded?.jti) {
        await this._refreshRepo.delete(decoded.jti);
      }
    } catch {}
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this._accessRepo.deleteAllForUser(userId);
    await this._refreshRepo.deleteAllForUser(userId);
  }
}
