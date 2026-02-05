import { UserRepository } from '../../../domain/user/repositories/UserRepository';
import { OTPRepository } from '../../../domain/otp/repositories/OTPRepository';
import { Email } from '../../../domain/user/value-objects/Email';
import { EmailServicePort } from '../ports/EmailServicePort';
import { ValidationError } from '../../../shared/errors/ValidationError';
import { ResendOTPRequestDTO } from '../dtos/ResendOTPRequestDTO';
import { ResendOTPResponseDTO } from '../dtos/ResendOTPResponseDTO';
export class ResendOTPUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly otpRepository: OTPRepository,
        private readonly emailService: EmailServicePort
    ) { }
    async execute(dto: ResendOTPRequestDTO): Promise<ResendOTPResponseDTO> {
        const email = new Email(dto.email);
        const existingUser = await this.userRepository.findByEmail(email);
        if (!existingUser) {
            throw new ValidationError('No account found with this email');
        }
        if (existingUser.isEmailVerified) {
            throw new ValidationError('Email is already verified');
        }
        const otp = this.generateOTP();
        await this.otpRepository.saveOTP(email.getValue(), otp);
        await this.emailService.sendOTP(email.getValue(), otp, existingUser.fullName);
        return {
            message: 'OTP sent successfully to your email',
            email: email.getValue(),
        };
    }
    private generateOTP(): string {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
}
