export interface IRefreshTokenUseCase {
  execute(refreshToken: string | undefined): Promise<{
    accessToken: string;
    newRefreshToken: string;
    role: string;
  }>;
}
