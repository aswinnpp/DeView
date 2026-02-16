import { injectable, inject } from 'inversify';
import { UserRepository } from "../../../domain/user/repositories/UserRepository";
import { OTPRepository } from "../../../domain/otp/repositories/OTPRepository";
import { User } from "../../../domain/user/entities/User";
import { Email } from "../../../domain/user/value-objects/Email";
import { Role } from "../../../domain/user/value-objects/Role";
import { OTPCode } from "../../../domain/otp/value-objects/OTPCode";
import { PasswordHasherPort } from "../ports/PasswordHasherPort";
import { EmailServicePort } from "../ports/EmailServicePort";
import { AppError } from "../../../shared/errors/AppError";
import { TYPES } from "../../../infrastructure/di/types";

export interface RegisterUserDTO {
  fullName: string;
  email: string;
  password: string;
  role: string;
}

@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject(TYPES.UserRepository) private readonly userRepo: UserRepository,
    @inject(TYPES.OTPRepository) private readonly otpRepo: OTPRepository,
    @inject(TYPES.PasswordHasherPort) private readonly passwordHasher: PasswordHasherPort,
    @inject(TYPES.EmailServicePort) private readonly emailService: EmailServicePort
  ) {}

  async execute(dto: RegisterUserDTO): Promise<{ message: string; email: string }> {
    const email = new Email(dto.email);
    const role = new Role(dto.role);

    const existingUser = await this.userRepo.findByEmail(email);

    if (existingUser && existingUser.isEmailVerified) {
    throw AppError.notFound("User not found");
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);

    const user = new User(
      existingUser?.id ?? null,
      dto.fullName,
      email,
      passwordHash,
      role,
      existingUser?.companyId,
      true,   
      false   
    );

    // Generate OTP
    const otp = OTPCode.generate();

    // Save user (repo decides insert/update)
    await this.userRepo.save(user);

    // Save OTP
    await this.otpRepo.save(email.getValue(), otp);

    // Send email
    await this.emailService.sendOTP(
      email.getValue(),
      otp.getValue(),
      dto.fullName
    );

    return {
      message: "OTP sent to your email. Please verify to complete registration.",
      email: email.getValue(),
    };
  }
}
