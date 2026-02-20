import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { OTPRepositoryPort } from "../ports/OTPRepositoryPort";
import { Email } from "../../../domain/user/value-objects/Email";
import { OTPCode } from "../../../domain/otp/value-objects/OTPCode";
import { AppError } from "../../../shared/errors/AppError";
import type { VerifyPasswordResetOTPUseCasePort } from "../ports/VerifyPasswordResetOTPUseCasePort";

@injectable()
export class VerifyPasswordResetOTPUseCase implements VerifyPasswordResetOTPUseCasePort {
  constructor(@inject(TYPES.OTPRepositoryPort) private otpRepository: OTPRepositoryPort) {}

  async execute(emailStr: string, otpStr: string) {
    const email = new Email(emailStr);
    const otp = new OTPCode(otpStr);

    const storedOTP = await this.otpRepository.find(email.getValue());

    if (!storedOTP || !storedOTP.equals(otp)) {
      throw AppError.badRequest("Invalid or expired OTP");
    }
  }
}
