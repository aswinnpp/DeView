import { UserRepository } from "../../../domain/user/repositories/UserRepository";
import { OTPRepository } from "../../../domain/otp/repositories/OTPRepository";
import { Email } from "../../../domain/user/value-objects/Email";
import { OTPCode } from "../../../domain/otp/value-objects/OTPCode";
import { PasswordHasherPort } from "../ports/PasswordHasherPort";
import { TokenServicePort } from "../ports/TokenServicePort";
import { AppError } from "../../../shared/errors/AppError";

export class ResetPasswordUseCase {
  constructor(
    private userRepo: UserRepository,
    private otpRepo: OTPRepository,
    private hasher: PasswordHasherPort,
    private tokenService: TokenServicePort
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
