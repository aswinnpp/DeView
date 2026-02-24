import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { IUserRepository } from "../../shared/ports/repository/IUserRepository";
import { IOtpRepository } from "../ports/repository/IOtpRepository";
import { Email } from "../../../domain/user/value-objects/Email";
import { OTPCode } from "../../../domain/otp/value-objects/OTPCode";
import { IEmailService } from "../ports/services/IEmailService";
import { AppError } from "../../../shared/errors/AppError";
import type { IForgotPasswordUseCase } from "../ports/usecase/IForgotPasswordUseCase";

@injectable()
export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort) private userRepo: IUserRepository,
    @inject(TYPES.OTPRepositoryPort) private otpRepo: IOtpRepository,
    @inject(TYPES.EmailServicePort) private emailService: IEmailService
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
