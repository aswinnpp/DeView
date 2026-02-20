export interface LogoutUseCasePort {
  execute(refreshToken?: string, accessToken?: string): Promise<{ success: true }>;
}
