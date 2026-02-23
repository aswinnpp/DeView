import { injectable, inject } from 'inversify';
import { UserRepositoryPort } from "../../shared/ports/repository/UserRepositoryPort";
import { OTPRepositoryPort } from "../ports/repository/OTPRepositoryPort";
import { User } from "../../../domain/user/entities/User";
import { Email } from "../../../domain/user/value-objects/Email";
import { Role } from "../../../domain/user/value-objects/Role";
import { OTPCode } from "../../../domain/otp/value-objects/OTPCode";
import { PasswordHasherPort } from "../ports/services/PasswordHasherPort";
import { EmailServicePort } from "../ports/services/EmailServicePort";
import { AppError } from "../../../shared/errors/AppError";
import { TYPES } from "../../../shared/di/types";
import type { RegisterUserUseCasePort, RegisterUserDTO } from "../ports/usecase/RegisterUserUseCasePort";

@injectable()
export class RegisterUserUseCase implements RegisterUserUseCasePort {
  constructor(
    @inject(TYPES.UserRepositoryPort) private readonly userRepo: UserRepositoryPort,
    @inject(TYPES.OTPRepositoryPort) private readonly otpRepo: OTPRepositoryPort,
    @inject(TYPES.PasswordHasherPort) private readonly passwordHasher: PasswordHasherPort,
    @inject(TYPES.EmailServicePort) private readonly emailService: EmailServicePort
  ) {}

  async execute(dto: RegisterUserDTO): Promise<{ message: string; email: string }> {
    const email = new Email(dto.email);
    const role = new Role(dto.role);

    const existingUser = await this.userRepo.findByEmail(email);

    if (existingUser && existingUser.isEmailVerified) {
    throw AppError.unauthorized("User already Exist");
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);

    const user = new User(
      existingUser?.id ?? null,
      dto.fullName,
      email,
      passwordHash,
      role,
      new Date(),
      dto.companyId ?? existingUser?.companyId,
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



