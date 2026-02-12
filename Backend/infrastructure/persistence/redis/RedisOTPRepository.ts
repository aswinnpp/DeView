import { RedisClientType } from "redis";
import { OTPRepository } from "../../../domain/otp/repositories/OTPRepository";
import { OTPCode } from "../../../domain/otp/value-objects/OTPCode";

export class RedisOTPRepository implements OTPRepository {
  private readonly PREFIX = "otp:";
  private readonly TTL_SECONDS = 60;

  constructor(private readonly redis: RedisClientType) {}

  private key(email: string): string {
    return `${this.PREFIX}${email.toLowerCase()}`;
  }

  async save(email: string, otp: OTPCode): Promise<void> {
    await this.redis.set(this.key(email), otp.getValue(), {
      EX: this.TTL_SECONDS,
    });
  }

  async find(email: string): Promise<OTPCode | null> {
    const value = await this.redis.get(this.key(email));

    if (!value) return null;

    return new OTPCode(value);
  }

  async delete(email: string): Promise<void> {
    await this.redis.del(this.key(email));
  }
}
