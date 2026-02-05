import { OTPRepository } from '../../../domain/otp/repositories/OTPRepository.js';
import { Email } from '../../../domain/user/value-objects/Email.js';

export class VerifyPasswordResetOTPUseCase {
    constructor(
        private otpRepository: OTPRepository
    ) { }

    async execute(email: string, otp: string): Promise<{ valid: boolean }> {
        const emailVO = new Email(email);

        const storedOTP = await this.otpRepository.findOTP(emailVO.getValue());

        if (!storedOTP || storedOTP !== otp) {
            return { valid: false };
        }

        return { valid: true };
    }
}
