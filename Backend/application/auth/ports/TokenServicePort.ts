export interface TokenPayload {
    userId: string;
    role: string;
    companyId?: string;
}

export interface RefreshTokenData {
    token: string;
    tokenHash: string;
    expiresAt: Date;
}

export interface TokenServicePort {
    signAccessToken(payload: TokenPayload): string;
    generateRefreshToken(userId: string, deviceInfo: string): Promise<RefreshTokenData>;
    verifyAccessToken(token: string): TokenPayload;
    rotateRefreshToken(oldTokenHash: string, deviceInfo: string): Promise<RefreshTokenData | null>;
    revokeRefreshToken(tokenHash: string): Promise<void>;
    revokeAllUserTokens(userId: string): Promise<void>;
}
