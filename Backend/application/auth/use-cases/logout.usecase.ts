import { injectable, inject } from 'inversify';
import jwt from 'jsonwebtoken';
import { TYPES } from "../../../shared/di/types";
import { ITokenService } from "../ports/services/ITokenService";
import type { ILogoutUseCase } from "../ports/usecase/ILogoutUseCase";

@injectable()
export class LogoutUseCase implements ILogoutUseCase {
  constructor(@inject(TYPES.TokenServicePort) private readonly _tokenService: ITokenService) {}

  async execute(refreshToken?: string, accessToken?: string): Promise<{ success: true }> {
    // Try to extract userId from the access token to revoke ALL sessions
    let userId: string | undefined;
    if (accessToken) {
      try {
        const decoded = jwt.decode(accessToken) as { userId?: string } | null;
        userId = decoded?.userId;
      } catch {
        // If decoding fails, fall back to single-token revocation
      }
    }

    if (userId) {
      // Revoke ALL sessions for this user across all devices
      await this._tokenService.revokeAllUserTokens(userId);
    } else {
      // Fallback: revoke only the current tokens
      if (refreshToken) {
        await this._tokenService.revokeRefreshToken(refreshToken);
      }
      if (accessToken) {
        await this._tokenService.revokeAccessToken(accessToken);
      }
    }
    return { success: true };
  }
}
