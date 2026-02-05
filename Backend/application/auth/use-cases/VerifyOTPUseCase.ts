import { UserRepository } from '../../../domain/user/repositories/UserRepository.js';
import { OTPRepository } from '../../../domain/otp/repositories/OTPRepository.js';
import { Email } from '../../../domain/user/value-objects/Email.js';
import { ValidationError } from '../../../shared/errors/ValidationError.js';
import { VerifyOTPRequestDTO } from '../dtos/VerifyOTPRequestDTO.js';
import { VerifyOTPResponseDTO } from '../dtos/VerifyOTPResponseDTO.js';

export class VerifyOTPUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly otpRepository: OTPRepository
    ) { }

    async execute(dto: VerifyOTPRequestDTO): Promise<VerifyOTPResponseDTO> {
        const email = new Email(dto.email);
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new ValidationError('User not found');
        }

        if (user.isEmailVerified) {
            throw new ValidationError('Email already verified');
        }

        const storedOTP = await this.otpRepository.findOTP(email.getValue());
        if (!storedOTP || storedOTP !== dto.otp) {
            throw new ValidationError('Invalid or expired OTP');
        }

        user.markEmailAsVerified();
        await this.userRepository.update(user);
        await this.otpRepository.deleteOTP(email.getValue());

        return {
            message: 'Email verified successfully. You can now login.',
        };
    }
}
