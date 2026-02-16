import { TokenServicePort } from "../ports/TokenServicePort";

export class LogoutUseCase {
  constructor(private readonly tokenService: TokenServicePort) {}

  async execute(refreshToken?: string, accessToken?: string): Promise<{ success: true }> {
    if (refreshToken) {
      await this.tokenService.revokeRefreshToken(refreshToken);
    }
    if (accessToken) {
      await this.tokenService.revokeAccessToken(accessToken);
    }
    return { success: true };
  }
}
