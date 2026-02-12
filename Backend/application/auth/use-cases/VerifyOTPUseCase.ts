import { UserRepository } from "../../../domain/user/repositories/UserRepository";
import { OTPRepository } from "../../../domain/otp/repositories/OTPRepository";
import { Email } from "../../../domain/user/value-objects/Email";
import { OTPCode } from "../../../domain/otp/value-objects/OTPCode";

export class VerifyOTPUseCase {
  constructor(
    private userRepo: UserRepository,
    private otpRepo: OTPRepository
  ) {}

  async execute(emailStr: string, otpStr: string) {
    const email = new Email(emailStr);
    const otp = new OTPCode(otpStr);

    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new Error("User not found");

    const stored = await this.otpRepo.find(email.getValue());
    if (!stored || !stored.equals(otp)) throw new Error("Invalid OTP");

    user.markEmailAsVerified();

    await this.userRepo.save(user);

    await this.otpRepo.delete(email.getValue());
  }
}
