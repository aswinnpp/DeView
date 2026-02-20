export interface RefreshTokenUseCasePort {
  execute(refreshToken: string | undefined): Promise<{
    accessToken: string;
    newRefreshToken: string;
    role: string;
  }>;
}
