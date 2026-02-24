import { RedisClientType } from "redis";

export class RedisAccessTokenRepository {
  constructor(private redis: RedisClientType) {}

  async save(jti: string, userId: string) {
    await this.redis.set(`access:${jti}`, userId, { EX: 5 });
  }

  async delete(jti: string) {
    await this.redis.del(`access:${jti}`);
  }

  async deleteAllForUser(userId: string) {
    const keys = await this.redis.keys("access:*");
    for (const key of keys) {
      const val = await this.redis.get(key);
      if (val === userId) await this.redis.del(key);
    }
  }
}
