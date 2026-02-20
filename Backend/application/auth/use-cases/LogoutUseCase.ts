import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { TokenServicePort } from "../ports/services/TokenServicePort";
import type { LogoutUseCasePort } from "../ports/usecase/LogoutUseCasePort";

@injectable()
export class LogoutUseCase implements LogoutUseCasePort {
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
