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
    @inject(TYPES.UserRepositoryPort) private _userRepo: IUserRepository,
    @inject(TYPES.OTPRepositoryPort) private _otpRepo: IOtpRepository,
    @inject(TYPES.EmailServicePort) private _emailService: IEmailService
  ) {}

  async execute(emailStr: string) {
    const email = new Email(emailStr);
    const user = await this._userRepo.findByEmail(email);
    if (!user) throw AppError.notFound("User not found");

    const otp = OTPCode.generate();

    await this._otpRepo.delete(email.getValue());
    await this._otpRepo.save(email.getValue(), otp);

    await this._emailService.sendPasswordResetOTP(
      email.getValue(),
      otp.getValue(),
      user.fullName
    );
  }
}
