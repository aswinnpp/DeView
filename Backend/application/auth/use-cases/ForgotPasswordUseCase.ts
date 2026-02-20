import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { UserRepositoryPort } from "../../shared/ports/UserRepositoryPort";
import { OTPRepositoryPort } from "../ports/OTPRepositoryPort";
import { Email } from "../../../domain/user/value-objects/Email";
import { OTPCode } from "../../../domain/otp/value-objects/OTPCode";
import { EmailServicePort } from "../ports/EmailServicePort";
import { AppError } from "../../../shared/errors/AppError";
import type { ForgotPasswordUseCasePort } from "../ports/ForgotPasswordUseCasePort";

@injectable()
export class ForgotPasswordUseCase implements ForgotPasswordUseCasePort {
  constructor(
    @inject(TYPES.UserRepositoryPort) private userRepo: UserRepositoryPort,
    @inject(TYPES.OTPRepositoryPort) private otpRepo: OTPRepositoryPort,
    @inject(TYPES.EmailServicePort) private emailService: EmailServicePort
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
