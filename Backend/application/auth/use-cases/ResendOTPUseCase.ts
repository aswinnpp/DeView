import { UserRepository } from "../../../domain/user/repositories/UserRepository";
import { OTPRepository } from "../../../domain/otp/repositories/OTPRepository";
import { Email } from "../../../domain/user/value-objects/Email";
import { OTPCode } from "../../../domain/otp/value-objects/OTPCode";
import { EmailServicePort } from "../ports/EmailServicePort";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { ResendOTPRequestDTO } from "../dtos/ResendOTPRequestDTO";
import { ResendOTPResponseDTO } from "../dtos/ResendOTPResponseDTO";

export class ResendOTPUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OTPRepository,
    private readonly emailService: EmailServicePort
  ) {}

  async execute(dto: ResendOTPRequestDTO): Promise<ResendOTPResponseDTO> {
    const email = new Email(dto.email);
    const existingUser = await this.userRepository.findByEmail(email);

    if (!existingUser) {
      throw new ValidationError("No account found with this email");
    }

    if (existingUser.isEmailVerified) {
      throw new ValidationError("Email is already verified");
    }

    // ✅ generate OTP via Value Object
    const otp = OTPCode.generate();

    // ✅ save OTPCode, not string
    await this.otpRepository.save(email.getValue(), otp);

    // email service still needs string
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
