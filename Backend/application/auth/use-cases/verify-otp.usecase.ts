import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { IUserRepository } from "../../shared/ports/repository/IUserRepository";
import { IOtpRepository } from "../ports/repository/IOtpRepository";
import { Email } from "../../../domain/user/value-objects/Email";
import { OTPCode } from "../../../domain/otp/value-objects/OTPCode";
import { AppError } from "../../../shared/errors/AppError";
import type { IVerifyOtpUseCase } from "../ports/usecase/IVerifyOtpUseCase";

@injectable()
export class VerifyOTPUseCase implements IVerifyOtpUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort) private _userRepo: IUserRepository,
    @inject(TYPES.OTPRepositoryPort) private _otpRepo: IOtpRepository
  ) {}

  async execute(emailStr: string, otpStr: string) {
    const email = new Email(emailStr);
    const otp = new OTPCode(otpStr);

    const user = await this._userRepo.findByEmail(email);

    if (!user) {
      throw AppError.notFound("User not found");
    }

    if (user.isEmailVerified) {
      throw AppError.badRequest("Email already verified");
    }

    const stored = await this._otpRepo.find(email.getValue());

    if (!stored || !stored.equals(otp)) {
      throw AppError.badRequest("Invalid or expired OTP");
    }

    user.markEmailAsVerified();

    await this._userRepo.save(user);

    await this._otpRepo.delete(email.getValue());
  }
}
