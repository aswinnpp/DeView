import { TokenServicePort } from "../ports/TokenServicePort";
import { UserRepository } from "../../../domain/user/repositories/UserRepository";

export class RefreshTokenUseCase {
  constructor(
    private tokenService: TokenServicePort,
    private userRepo: UserRepository
  ) {}

  async execute(refreshToken: string) {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    if (!payload) throw new Error("Invalid refresh token");

    const rotated = await this.tokenService.rotateRefreshToken(refreshToken);
    if (!rotated) throw new Error("Rotation failed");

    const user = await this.userRepo.findById(payload.userId);
    if (!user) throw new Error("User not found");

    const accessToken = await this.tokenService.signAccessToken({
      userId: user.id!,
      role: user.role.getValue(),
      ...(user.companyId && { companyId: user.companyId }),
    });

    return {
      accessToken,
      newRefreshToken: rotated.token,
    };
  }
}
