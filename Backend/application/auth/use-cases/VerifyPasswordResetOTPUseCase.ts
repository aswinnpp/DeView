import { OTPRepository } from "../../../domain/otp/repositories/OTPRepository";
import { Email } from "../../../domain/user/value-objects/Email";
import { OTPCode } from "../../../domain/otp/value-objects/OTPCode";

export class VerifyPasswordResetOTPUseCase {
  constructor(private otpRepository: OTPRepository) {}

  async execute(emailStr: string, otpStr: string): Promise<{ valid: boolean }> {
    const email = new Email(emailStr);
    const otp = new OTPCode(otpStr);

    const storedOTP = await this.otpRepository.find(email.getValue());

    if (!storedOTP || !storedOTP.equals(otp)) {
      return { valid: false };
    }

    return { valid: true };
  }
}
