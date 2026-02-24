import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { IUserRepository } from "../../shared/ports/repository/IUserRepository";
import { IOtpRepository } from "../ports/repository/IOtpRepository";
import { Email } from "../../../domain/user/value-objects/Email";
import { OTPCode } from "../../../domain/otp/value-objects/OTPCode";
import { IPasswordHasher } from "../ports/services/IPasswordHasher";
import { ITokenService } from "../ports/services/ITokenService";
import { AppError } from "../../../shared/errors/AppError";
import type { IResetPasswordUseCase } from "../ports/usecase/IResetPasswordUseCase";

@injectable()
export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort) private userRepo: IUserRepository,
    @inject(TYPES.OTPRepositoryPort) private otpRepo: IOtpRepository,
    @inject(TYPES.PasswordHasherPort) private hasher: IPasswordHasher,
    @inject(TYPES.TokenServicePort) private tokenService: ITokenService
  ) {}

  async execute(emailStr: string, otpStr: string, newPassword: string) {
    const email = new Email(emailStr);
    const otp = new OTPCode(otpStr);

    const stored = await this.otpRepo.find(email.getValue());

    if (!stored || !stored.equals(otp)) {
      throw AppError.badRequest("Invalid or expired OTP");
    }

    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      throw AppError.notFound("User not found");
    }

    const hash = await this.hasher.hash(newPassword);

    user.passwordHash = hash;

    await this.userRepo.save(user);

    await this.otpRepo.delete(email.getValue());

    await this.tokenService.revokeAllUserTokens(user.id!);
  }
}
