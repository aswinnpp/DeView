import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { ITokenService } from "../ports/services/ITokenService";
import type { ILogoutUseCase } from "../ports/usecase/ILogoutUseCase";

@injectable()
export class LogoutUseCase implements ILogoutUseCase {
  constructor(@inject(TYPES.TokenServicePort) private readonly _tokenService: ITokenService) {}

  async execute(refreshToken?: string, accessToken?: string): Promise<{ success: true }> {
    if (refreshToken) {
      await this._tokenService.revokeRefreshToken(refreshToken);
    }
    if (accessToken) {
      await this._tokenService.revokeAccessToken(accessToken);
    }
    return { success: true };
  }
}
