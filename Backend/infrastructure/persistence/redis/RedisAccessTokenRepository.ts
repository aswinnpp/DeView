import { RedisClientType } from "redis";

export class RedisAccessTokenRepository {
  constructor(private _redis: RedisClientType) {}

  async save(jti: string, userId: string) {
    await this._redis.set(`access:${jti}`, userId, { EX: 900 });
  }

  async delete(jti: string) {
    await this._redis.del(`access:${jti}`);
  }

  async deleteAllForUser(userId: string) {
    const keys = await this._redis.keys("access:*");
    for (const key of keys) {
      const val = await this._redis.get(key);
      if (val === userId) await this._redis.del(key);
    }
  }
}
