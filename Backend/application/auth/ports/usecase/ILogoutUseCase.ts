export interface ILogoutUseCase {
  execute(refreshToken?: string, accessToken?: string): Promise<{ success: true }>;
}
