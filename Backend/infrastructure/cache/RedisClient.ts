import { createClient, type RedisClientType } from "redis";
import { env } from "../config/env.js";

export const redisClient: RedisClientType = createClient({
  url: env.REDIS_URL,
});

redisClient.on("error", (err) => {
  process.stderr.write(`Redis Error: ${String(err)}\n`);
});


