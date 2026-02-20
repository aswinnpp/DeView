import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { UserRepositoryPort } from "../../shared/ports/repository/UserRepositoryPort";
import { OTPRepositoryPort } from "../ports/repository/OTPRepositoryPort";
import { Email } from "../../../domain/user/value-objects/Email";
import { OTPCode } from "../../../domain/otp/value-objects/OTPCode";
import { EmailServicePort } from "../ports/services/EmailServicePort";
import { AppError } from "../../../shared/errors/AppError";
import { ResendOTPRequestDTO } from "../dtos/ResendOTPRequestDTO";
import { ResendOTPResponseDTO } from "../dtos/ResendOTPResponseDTO";
import type { ResendOTPUseCasePort } from "../ports/usecase/ResendOTPUseCasePort";

@injectable()
export class ResendOTPUseCase implements ResendOTPUseCasePort {
  constructor(
    @inject(TYPES.UserRepositoryPort) private readonly userRepository: UserRepositoryPort,
    @inject(TYPES.OTPRepositoryPort) private readonly otpRepository: OTPRepositoryPort,
    @inject(TYPES.EmailServicePort) private readonly emailService: EmailServicePort
  ) {}

  async execute(dto: ResendOTPRequestDTO): Promise<ResendOTPResponseDTO> {
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
