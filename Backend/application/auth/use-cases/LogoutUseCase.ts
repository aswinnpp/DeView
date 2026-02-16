import { injectable, inject } from 'inversify';
import { TYPES } from "../../../infrastructure/di/types";
import { TokenServicePort } from "../ports/TokenServicePort";

@injectable()
export class LogoutUseCase {
  constructor(@inject(TYPES.TokenServicePort) private readonly tokenService: TokenServicePort) {}

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
