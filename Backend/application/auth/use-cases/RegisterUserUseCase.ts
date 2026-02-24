import { injectable, inject } from 'inversify';
import { IUserRepository } from "../../shared/ports/repository/IUserRepository";
import { IOtpRepository } from "../ports/repository/IOtpRepository";
import { User } from "../../../domain/user/entities/User";
import { Email } from "../../../domain/user/value-objects/Email";
import { Role } from "../../../domain/user/value-objects/Role";
import { OTPCode } from "../../../domain/otp/value-objects/OTPCode";
import { IPasswordHasher } from "../ports/services/IPasswordHasher";
import { IEmailService } from "../ports/services/IEmailService";
import { AppError } from "../../../shared/errors/AppError";
import { TYPES } from "../../../shared/di/types";
import type { IRegisterUserUseCase, IRegisterUserDTO } from "../ports/usecase/IRegisterUserUseCase";

@injectable()
export class RegisterUserUseCase implements IRegisterUserUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort) private readonly userRepo: IUserRepository,
    @inject(TYPES.OTPRepositoryPort) private readonly otpRepo: IOtpRepository,
    @inject(TYPES.PasswordHasherPort) private readonly passwordHasher: IPasswordHasher,
    @inject(TYPES.EmailServicePort) private readonly emailService: IEmailService
  ) {}

  async execute(dto: IRegisterUserDTO): Promise<{ message: string; email: string }> {
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



