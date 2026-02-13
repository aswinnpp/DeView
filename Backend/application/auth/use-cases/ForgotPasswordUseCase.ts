import { UserRepository } from "../../../domain/user/repositories/UserRepository";
import { OTPRepository } from "../../../domain/otp/repositories/OTPRepository";
import { Email } from "../../../domain/user/value-objects/Email";
import { OTPCode } from "../../../domain/otp/value-objects/OTPCode";
import { EmailServicePort } from "../ports/EmailServicePort";
import { AppError } from "../../../shared/errors/AppError";
export class ForgotPasswordUseCase {
  constructor(
    private userRepo: UserRepository,
    private otpRepo: OTPRepository,
    private emailService: EmailServicePort
  ) {}

  async execute(emailStr: string) {
    const email = new Email(emailStr);
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw AppError.notFound("User not found");

    const otp = OTPCode.generate();

    await this.otpRepo.delete(email.getValue());
    await this.otpRepo.save(email.getValue(), otp);

    await this.emailService.sendPasswordResetOTP(
      email.getValue(),
      otp.getValue(),
      user.fullName
    );
  }
}
