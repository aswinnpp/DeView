import { UserRepository } from '../../../domain/user/repositories/UserRepository.js';
import { OTPRepository } from '../../../domain/otp/repositories/OTPRepository.js';
import { EmailServicePort } from '../ports/EmailServicePort.js';
import { Email } from '../../../domain/user/value-objects/Email.js';

import { ValidationError } from '../../../shared/errors/ValidationError.js';

export class ForgotPasswordUseCase {
    constructor(
        private userRepository: UserRepository,
        private otpRepository: OTPRepository,
        private emailService: EmailServicePort
    ) { }

    async execute(email: string): Promise<void> {
        const emailVO = new Email(email);
        const user = await this.userRepository.findByEmail(emailVO);

        if (!user) {
            throw new ValidationError('Email does not exist');
        }

        if (user.authProvider === 'google') {
            throw new Error('Password reset is not available for Google accounts. Please use Google to sign in.');
        }

        await this.otpRepository.deleteOTP(user.email.getValue());

        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

        await this.otpRepository.saveOTP(user.email.getValue(), otpCode);

        await this.emailService.sendPasswordResetOTP(
            user.email.getValue(),
            otpCode,
            user.fullName
        );
    }
}
