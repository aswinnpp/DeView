import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { ITokenService } from "../ports/services/ITokenService";
import { IUserRepository } from "../../shared/ports/repository/IUserRepository";
import { AppError } from "../../../shared/errors/AppError";
import type { IRefreshTokenUseCase } from "../ports/usecase/IRefreshTokenUseCase";

@injectable()
export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(
    @inject(TYPES.TokenServicePort) private _tokenService: ITokenService,
    @inject(TYPES.UserRepositoryPort) private _userRepo: IUserRepository
  ) {}

  async execute(refreshToken: string | undefined) {
    if (!refreshToken) {
      throw AppError.unauthorized("Refresh token missing");
    }

    const payload = await this._tokenService.verifyRefreshToken(refreshToken);

    if (!payload) {
      throw AppError.unauthorized("Invalid or expired refresh token");
    }

    const rotated = await this._tokenService.rotateRefreshToken(refreshToken);

    if (!rotated) {
      throw AppError.unauthorized("Refresh token rotation failed");
    }

    const user = await this._userRepo.findById(payload.userId);

    if (!user) {
      throw AppError.unauthorized("User not found");
    }

    if (!user.isActive) {
      throw AppError.forbidden("Account is deactivated");
    }

    const accessToken = await this._tokenService.signAccessToken({
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
