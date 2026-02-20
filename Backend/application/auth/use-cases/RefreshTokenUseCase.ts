import { injectable, inject } from 'inversify';
import { TYPES } from "../../../infrastructure/di/types";
import { TokenServicePort } from "../ports/TokenServicePort";
import { UserRepositoryPort } from "../../shared/ports/UserRepositoryPort";
import { AppError } from "../../../shared/errors/AppError";
import type { RefreshTokenUseCasePort } from "../ports/RefreshTokenUseCasePort";

@injectable()
export class RefreshTokenUseCase implements RefreshTokenUseCasePort {
  constructor(
    @inject(TYPES.TokenServicePort) private tokenService: TokenServicePort,
    @inject(TYPES.UserRepositoryPort) private userRepo: UserRepositoryPort
  ) {}

  async execute(refreshToken: string | undefined) {
    if (!refreshToken) {
      throw AppError.unauthorized("Refresh token missing");
    }

    const payload = await this.tokenService.verifyRefreshToken(refreshToken);

    if (!payload) {
      throw AppError.unauthorized("Invalid or expired refresh token");
    }

    const rotated = await this.tokenService.rotateRefreshToken(refreshToken);

    if (!rotated) {
      throw AppError.unauthorized("Refresh token rotation failed");
    }

    const user = await this.userRepo.findById(payload.userId);

    if (!user) {
      throw AppError.unauthorized("User not found");
    }

    if (!user.isActive) {
      throw AppError.forbidden("Account is deactivated");
    }

    const accessToken = await this.tokenService.signAccessToken({
      userId: user.id!,
      role: user.role.getValue(),
      ...(user.companyId && { companyId: user.companyId }),
    });

    return {
      accessToken,
      newRefreshToken: rotated.token,
      role: user.role.getValue()
    };
  }
}
