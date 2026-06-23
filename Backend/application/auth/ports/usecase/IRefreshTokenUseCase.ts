export interface IRefreshTokenUseCase {
  execute(
    refreshToken: string | undefined,
    authType: "admin" | "user"
  ): Promise<{
    accessToken: string;
    newRefreshToken: string;
    role: string;
  }>;
}