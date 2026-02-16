import { injectable, inject } from 'inversify';
import { TYPES } from "../../../infrastructure/di/types";
import { UserRepository } from "../../../domain/user/repositories/UserRepository";
import { OTPRepository } from "../../../domain/otp/repositories/OTPRepository";
import { Email } from "../../../domain/user/value-objects/Email";
import { OTPCode } from "../../../domain/otp/value-objects/OTPCode";
import { AppError } from "../../../shared/errors/AppError";

@injectable()
export class VerifyOTPUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepo: UserRepository,
    @inject(TYPES.OTPRepository) private otpRepo: OTPRepository
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
