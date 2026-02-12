import { RedisClientType } from "redis";

export class RedisRefreshTokenRepository {
  constructor(private redis: RedisClientType) {}

  async save(userId: string, tokenId: string) {
    await this.redis.set(`refresh:${tokenId}`, userId, { EX: 604800 });
  }

  async exists(tokenId: string) {
    return (await this.redis.exists(`refresh:${tokenId}`)) === 1;
  }

  async delete(tokenId: string) {
    await this.redis.del(`refresh:${tokenId}`);
  }

  async deleteAllForUser(userId: string) {
    const keys = await this.redis.keys("refresh:*");

    for (const key of keys) {
      const val = await this.redis.get(key);
      if (val === userId) await this.redis.del(key);
    }
  }
}
