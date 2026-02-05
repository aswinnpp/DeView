import { UserRepository } from '../../../domain/user/repositories/UserRepository.js';
import { OTPRepository } from '../../../domain/otp/repositories/OTPRepository.js';
import { PasswordHasherPort } from '../ports/PasswordHasherPort.js';
import { TokenServicePort } from '../ports/TokenServicePort.js';
import { Email } from '../../../domain/user/value-objects/Email.js';

export class ResetPasswordUseCase {
    constructor(
        private userRepository: UserRepository,
        private otpRepository: OTPRepository,
        private passwordHasher: PasswordHasherPort,
        private tokenService: TokenServicePort
    ) { }

    async execute(email: string, otp: string, newPassword: string): Promise<void> {
        const emailVO = new Email(email);

        const storedOTP = await this.otpRepository.findOTP(emailVO.getValue());

        if (!storedOTP || storedOTP !== otp) {
            throw new Error('Invalid or expired OTP');
        }

        const user = await this.userRepository.findByEmail(emailVO);

        if (!user) {
            throw new Error('User not found');
        }

        if (user.authProvider === 'google') {
            throw new Error('Cannot reset password for Google accounts');
        }

        const hashedPassword = await this.passwordHasher.hash(newPassword);

        await this.userRepository.updatePassword(user.id!, hashedPassword);

        await this.otpRepository.deleteOTP(emailVO.getValue());

        await this.tokenService.revokeAllUserTokens(user.id!);
    }
}
