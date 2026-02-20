import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { UserRepositoryPort } from "../../shared/ports/repository/UserRepositoryPort";
import { OTPRepositoryPort } from "../ports/repository/OTPRepositoryPort";
import { Email } from "../../../domain/user/value-objects/Email";
import { OTPCode } from "../../../domain/otp/value-objects/OTPCode";
import { AppError } from "../../../shared/errors/AppError";
import type { VerifyOTPUseCasePort } from "../ports/usecase/VerifyOTPUseCasePort";

@injectable()
export class VerifyOTPUseCase implements VerifyOTPUseCasePort {
  constructor(
    @inject(TYPES.UserRepositoryPort) private userRepo: UserRepositoryPort,
    @inject(TYPES.OTPRepositoryPort) private otpRepo: OTPRepositoryPort
  ) {}

  async execute(emailStr: string, otpStr: string) {
    const email = new Email(emailStr);
    const otp = new OTPCode(otpStr);

    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      throw AppError.notFound("User not found");
    }

    if (user.isEmailVerified) {
      throw AppError.badRequest("Email already verified");
    }

    const stored = await this.otpRepo.find(email.getValue());

    if (!stored || !stored.equals(otp)) {
      throw AppError.badRequest("Invalid or expired OTP");
    }

    user.markEmailAsVerified();

    await this.userRepo.save(user);

    await this.otpRepo.delete(email.getValue());
  }
}
