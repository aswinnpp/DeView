import { OTPRepository } from '../../../domain/otp/repositories/OTPRepository.js';
import { redisClient } from '../../cache/RedisClient.js';

export class RedisOTPRepository implements OTPRepository {
    private readonly OTP_PREFIX = 'otp:';
    private readonly OTP_TTL_SECONDS = 300; // 5 minutes

    private getKey(email: string): string {
        return `${this.OTP_PREFIX}${email.toLowerCase()}`;
    }

    async saveOTP(email: string, otp: string): Promise<void> {
        const key = this.getKey(email);
        await redisClient.setex(key, this.OTP_TTL_SECONDS, otp);
    }

    async findOTP(email: string): Promise<string | null> {
        const key = this.getKey(email);
        return await redisClient.get(key);
    }

    async deleteOTP(email: string): Promise<void> {
        const key = this.getKey(email);
        await redisClient.del(key);
    }
}
