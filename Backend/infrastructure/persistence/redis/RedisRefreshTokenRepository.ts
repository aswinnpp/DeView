import { RedisClientType } from "redis";

export class RedisRefreshTokenRepository {
  constructor(private _redis: RedisClientType) {}

  async save(userId: string, tokenId: string) {
    await this._redis.set(`refresh:${tokenId}`, userId, { EX: 604800 });
  }

  async exists(tokenId: string) {
    return (await this._redis.exists(`refresh:${tokenId}`)) === 1;
  }

  async delete(tokenId: string) {
    await this._redis.del(`refresh:${tokenId}`);
  }

  async deleteAllForUser(userId: string) {
    const keys = await this._redis.keys("refresh:*");

    for (const key of keys) {
      const val = await this._redis.get(key);
      if (val === userId) await this._redis.del(key);
    }
  }
}
