import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { IUserRepository } from "../../shared/ports/repository/IUserRepository";
import { IOtpRepository } from "../ports/repository/IOtpRepository";
import { Email } from "../../../domain/value-objects/Email";
import { OTPCode } from "../../../domain/value-objects/OTPCode";
import { IPasswordHasher } from "../ports/services/IPasswordHasher";
import { ITokenService } from "../ports/services/ITokenService";
import { AppError } from "../../../shared/errors/AppError";
import type { IResetPasswordUseCase } from "../ports/usecase/IResetPasswordUseCase";

@injectable()
export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort) private _userRepo: IUserRepository,
    @inject(TYPES.OTPRepositoryPort) private _otpRepo: IOtpRepository,
    @inject(TYPES.PasswordHasherPort) private _hasher: IPasswordHasher,
    @inject(TYPES.TokenServicePort) private _tokenService: ITokenService
  ) {}

  async execute(emailStr: string, otpStr: string, newPassword: string) {
    const email = new Email(emailStr);
    const otp = new OTPCode(otpStr);

    const stored = await this._otpRepo.find(email.getValue());

    if (!stored || !stored.equals(otp)) {
      throw AppError.badRequest("Invalid or expired OTP");
    }

    const user = await this._userRepo.findByEmail(email);

    if (!user) {
      throw AppError.notFound("User not found");
    }

    const hash = await this._hasher.hash(newPassword);

    user.passwordHash = hash;

    await this._userRepo.save(user);

    await this._otpRepo.delete(email.getValue());

    await this._tokenService.revokeAllUserTokens(user.id!);
  }
}
