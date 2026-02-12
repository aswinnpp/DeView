// application/auth/usecases/RegisterUserUseCase.ts

import { UserRepository } from "../../../domain/user/repositories/UserRepository";
import { OTPRepository } from "../../../domain/otp/repositories/OTPRepository";
import { User } from "../../../domain/user/entities/User";
import { Email } from "../../../domain/user/value-objects/Email";
import { Role } from "../../../domain/user/value-objects/Role";
import { OTPCode } from "../../../domain/otp/value-objects/OTPCode";
import { PasswordHasherPort } from "../ports/PasswordHasherPort";
import { EmailServicePort } from "../ports/EmailServicePort";

export interface RegisterUserDTO {
  fullName: string;
  email: string;
  password: string;
  role: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly otpRepo: OTPRepository,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly emailService: EmailServicePort
  ) {}

  async execute(dto: RegisterUserDTO): Promise<{ message: string; email: string }> {
    // 1. Convert raw input into Value Objects
    const email = new Email(dto.email);
    const role = new Role(dto.role);

    // 2. Check existing user
    const existingUser = await this.userRepo.findByEmail(email);

    if (existingUser && existingUser.isEmailVerified) {
      throw new Error("Email already registered");
    }

    // 3. Hash password
    const passwordHash = await this.passwordHasher.hash(dto.password);

    // 4. Create Domain User (id = null, Mongo will generate)
    const user = new User(
      null,
      dto.fullName,
      email,
      passwordHash,
      role
    );

    // 5. Generate OTP (Value Object)
    const otp = OTPCode.generate();

    // 6. Save user
    if (existingUser) {
     await this.userRepo.save(user);
    }

    // 7. Save OTP
    await this.otpRepo.save(email.getValue(), otp);

    // 8. Send email
    await this.emailService.sendOTP(
      email.getValue(),
      otp.getValue(),
      dto.fullName
    );

    // 9. Return response
    return {
      message: "OTP sent to your email. Please verify to complete registration.",
      email: email.getValue(),
    };
  }
}
