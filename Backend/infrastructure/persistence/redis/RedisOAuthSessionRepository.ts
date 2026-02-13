import { OAuthSessionPort } from "../../../application/auth/ports/OAuthSessionPort";
import { RedisClientType } from "redis";

export class RedisOAuthSessionRepository implements OAuthSessionPort {
  constructor(private redis: RedisClientType) {}

  async save(sessionId: string, payload: unknown): Promise<void> {
    await this.redis.setEx(
      `oauth:session:${sessionId}`,
      900,
      JSON.stringify(payload)
    );
  }

  async get(sessionId: string): Promise<string | null> {
    return this.redis.get(`oauth:session:${sessionId}`);
  }

  async delete(sessionId: string): Promise<void> {
    await this.redis.del(`oauth:session:${sessionId}`);
  }
}
