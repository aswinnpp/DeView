import { RedisClientType } from "redis";

export class RedisAccessTokenRepository {
  constructor(private redis: RedisClientType) {}

  async save(jti: string, userId: string) {
    await this.redis.set(`access:${jti}`, userId, { EX: 900 });
  }

  async delete(jti: string) {
    await this.redis.del(`access:${jti}`);
  }
}
