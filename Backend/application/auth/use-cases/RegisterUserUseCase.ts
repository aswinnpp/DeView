import { UserRepository } from '../../../domain/user/repositories/UserRepository.js';
import { OTPRepository } from '../../../domain/otp/repositories/OTPRepository.js';
import { User } from '../../../domain/user/entities/User.js';
import { Email } from '../../../domain/user/value-objects/Email.js';
import { Role } from '../../../domain/user/value-objects/Role.js';
import { ConflictError } from '../../../shared/errors/ConflictError.js';
import { PasswordHasherPort } from '../ports/PasswordHasherPort.js';
import { EmailServicePort } from '../ports/EmailServicePort.js';
import { RegisterUserRequestDTO } from '../dtos/RegisterUserRequestDTO.js';
import { RegisterUserResponseDTO } from '../dtos/RegisterUserResponseDTO.js';
export class RegisterUserUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly otpRepository: OTPRepository,
        private readonly passwordHasher: PasswordHasherPort,
        private readonly emailService: EmailServicePort
    ) { }
    async execute(dto: RegisterUserRequestDTO): Promise<RegisterUserResponseDTO> {
        const email = new Email(dto.email);
        const role = new Role(dto.role);
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser && existingUser.isEmailVerified) {
            throw new ConflictError('Email already registered');
        }
        const passwordHash = await this.passwordHasher.hash(dto.password);
        const user = User.create({
            fullName: dto.fullName,
            companyName: role.isCompany() ? dto.fullName : null,
            email,
            passwordHash,
            role,
            authProvider: 'email',
        });
        const otp = this.generateOTP();
        await this.otpRepository.saveOTP(email.getValue(), otp);
        if (existingUser) {
            await this.userRepository.update(user);
        } else {
            await this.userRepository.create(user);
        }
        await this.emailService.sendOTP(email.getValue(), otp, dto.fullName);
        return {
            message: 'OTP sent to your email. Please verify to complete registration.',
            email: email.getValue(),
        };
    }
    private generateOTP(): string {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
}
