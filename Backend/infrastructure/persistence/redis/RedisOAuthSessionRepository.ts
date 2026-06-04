import { IOAuthSession } from "../../../application/auth/ports/services/IOAuthSession";
import { RedisClientType } from "redis";
import { env } from "../../config/env.js";

export class RedisOAuthSessionRepository implements IOAuthSession {
  constructor(private _redis: RedisClientType) {}

  async save(sessionId: string, payload: IOAuthSession["save"] extends (id: string, p: infer P) => Promise<void> ? P : never): Promise<void> {
    await this._redis.setEx(
      `oauth:session:${sessionId}`,
      env.OAUTH_SESSION_TTL_SECONDS,
      JSON.stringify(payload)
    );
  }

  async get(sessionId: string): Promise<string | null> {
    return this._redis.get(`oauth:session:${sessionId}`);
  }

  async delete(sessionId: string): Promise<void> {
    await this._redis.del(`oauth:session:${sessionId}`);
  }
}
