import { RedisClientType } from "redis";
import { IOtpRepository } from "../../../application/auth/ports/repository/IOtpRepository";
import { OTPCode } from "../../../domain/value-objects/OTPCode";

export class RedisOTPRepository implements IOtpRepository {
  private readonly _PREFIX = "otp:";
  private readonly _TTL_SECONDS = 60;

  constructor(private readonly _redis: RedisClientType) {}

  private key(email: string): string {
    return `${this._PREFIX}${email.toLowerCase()}`;
  }

  async save(email: string, otp: OTPCode): Promise<void> {
    await this._redis.set(this.key(email), otp.getValue(), {
      EX: this._TTL_SECONDS,
    });
  }

  async find(email: string): Promise<OTPCode | null> {
    const value = await this._redis.get(this.key(email));

    if (!value) return null;

    return new OTPCode(value);
  }

  async delete(email: string): Promise<void> {
    await this._redis.del(this.key(email));
  }
}
