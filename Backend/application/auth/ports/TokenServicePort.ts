export interface TokenPayload {
  userId: string;
  role: string;
  companyId?: string;
}

export interface RefreshTokenPayload {
  userId: string;
  jti: string;
}

export interface RefreshTokenData {
  token: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface TokenServicePort {
  signAccessToken(payload: TokenPayload): Promise<string>;

  generateRefreshToken(userId: string): Promise<RefreshTokenData>;

  verifyAccessToken(token: string): TokenPayload;

  verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null>;

  rotateRefreshToken(oldToken: string): Promise<RefreshTokenData | null>;

  revokeRefreshToken(token: string): Promise<void>;

  revokeAccessToken(token: string): Promise<void>;

  revokeAllUserTokens(userId: string): Promise<void>;
}
