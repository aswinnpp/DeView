import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { IUserRepository } from "../../shared/ports/repository/IUserRepository";
import { IOtpRepository } from "../ports/repository/IOtpRepository";
import { Email } from "../../../domain/user/value-objects/Email";
import { OTPCode } from "../../../domain/otp/value-objects/OTPCode";
import { IEmailService } from "../ports/services/IEmailService";
import { AppError } from "../../../shared/errors/AppError";
import { IResendOtpRequestDTO } from "../dtos/ResendOTPRequestDTO";
import { IResendOtpResponseDTO } from "../dtos/ResendOTPResponseDTO";
import type { IResendOtpUseCase } from "../ports/usecase/IResendOtpUseCase";

@injectable()
export class ResendOTPUseCase implements IResendOtpUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort) private readonly userRepository: IUserRepository,
    @inject(TYPES.OTPRepositoryPort) private readonly otpRepository: IOtpRepository,
    @inject(TYPES.EmailServicePort) private readonly emailService: IEmailService
  ) {}

  async execute(dto: IResendOtpRequestDTO): Promise<IResendOtpResponseDTO> {
    const email = new Email(dto.email);

    const existingUser = await this.userRepository.findByEmail(email);

    if (!existingUser) {
      throw AppError.notFound("No account found with this email");
    }

    if (existingUser.isEmailVerified) {
      throw AppError.badRequest("Email is already verified");
    }

    const otp = OTPCode.generate();

    await this.otpRepository.save(email.getValue(), otp);

    await this.emailService.sendOTP(
      email.getValue(),
      otp.getValue(),
      existingUser.fullName
    );

    return {
      message: "OTP sent successfully to your email",
      email: email.getValue(),
    };
  }
}
