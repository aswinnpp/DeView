import { injectable, inject } from 'inversify';
import { TYPES } from "../../../infrastructure/di/types";
import { OTPRepository } from "../../../domain/otp/repositories/OTPRepository";
import { Email } from "../../../domain/user/value-objects/Email";
import { OTPCode } from "../../../domain/otp/value-objects/OTPCode";
import { AppError } from "../../../shared/errors/AppError";

@injectable()
export class VerifyPasswordResetOTPUseCase {
  constructor(@inject(TYPES.OTPRepository) private otpRepository: OTPRepository) {}

  async execute(emailStr: string, otpStr: string) {
    const email = new Email(emailStr);
    const otp = new OTPCode(otpStr);

    const storedOTP = await this.otpRepository.find(email.getValue());

    if (!storedOTP || !storedOTP.equals(otp)) {
      throw AppError.badRequest("Invalid or expired OTP");
    }
  }
}
