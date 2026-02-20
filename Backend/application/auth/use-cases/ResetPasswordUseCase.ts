import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { UserRepositoryPort } from "../../shared/ports/repository/UserRepositoryPort";
import { OTPRepositoryPort } from "../ports/repository/OTPRepositoryPort";
import { Email } from "../../../domain/user/value-objects/Email";
import { OTPCode } from "../../../domain/otp/value-objects/OTPCode";
import { PasswordHasherPort } from "../ports/services/PasswordHasherPort";
import { TokenServicePort } from "../ports/services/TokenServicePort";
import { AppError } from "../../../shared/errors/AppError";
import type { ResetPasswordUseCasePort } from "../ports/usecase/ResetPasswordUseCasePort";

@injectable()
export class ResetPasswordUseCase implements ResetPasswordUseCasePort {
  constructor(
    @inject(TYPES.UserRepositoryPort) private userRepo: UserRepositoryPort,
    @inject(TYPES.OTPRepositoryPort) private otpRepo: OTPRepositoryPort,
    @inject(TYPES.PasswordHasherPort) private hasher: PasswordHasherPort,
    @inject(TYPES.TokenServicePort) private tokenService: TokenServicePort
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
