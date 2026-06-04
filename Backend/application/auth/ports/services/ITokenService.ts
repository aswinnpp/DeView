export interface ITokenPayload {
  userId: string;
  role: string;
  companyId?: string;
}

export interface IRefreshTokenPayload {
  userId: string;
  jti: string;
}

export interface IRefreshTokenData {
  token: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface ITokenService {
  signAccessToken(payload: ITokenPayload): Promise<string>;

  generateRefreshToken(userId: string): Promise<IRefreshTokenData>;

  verifyAccessToken(token: string): ITokenPayload;

  verifyRefreshToken(token: string): Promise<IRefreshTokenPayload | null>;

  rotateRefreshToken(oldToken: string): Promise<IRefreshTokenData | null>;

  revokeRefreshToken(token: string): Promise<void>;

  revokeAccessToken(token: string): Promise<void>;

  revokeAllUserTokens(userId: string): Promise<void>;
}
