import { IOAuthSession } from "../../../application/auth/ports/services/IOAuthSession";
import { RedisClientType } from "redis";

export class RedisOAuthSessionRepository implements IOAuthSession {
  constructor(private redis: RedisClientType) {}

  async save(sessionId: string, payload: IOAuthSession["save"] extends (id: string, p: infer P) => Promise<void> ? P : never): Promise<void> {
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
