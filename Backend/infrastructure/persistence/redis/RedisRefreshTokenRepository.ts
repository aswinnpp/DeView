import { redisClient } from '../../cache/RedisClient.js';

export class RedisRefreshTokenRepository {
    private readonly PREFIX = 'refresh:';
    private readonly TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

    // Save refresh token (store just the userId to mark as valid)
    async save(userId: string, tokenId: string): Promise<void> {
        const key = `${this.PREFIX}${tokenId}`;
        await redisClient.setex(key, this.TTL_SECONDS, userId);
    }

    // Check if token exists and is valid
    async exists(tokenId: string): Promise<boolean> {
        return await redisClient.exists(`${this.PREFIX}${tokenId}`);
    }

    // Get userId from token
    async getUserId(tokenId: string): Promise<string | null> {
        return await redisClient.get(`${this.PREFIX}${tokenId}`);
    }

    // Delete a specific token (logout)
    async delete(tokenId: string): Promise<void> {
        await redisClient.del(`${this.PREFIX}${tokenId}`);
    }

    // Delete all tokens for a user (logout all devices)
    async deleteAllForUser(userId: string): Promise<void> {
        const pattern = `${this.PREFIX}*`;
        const keys = await redisClient.keys(pattern);

        for (const key of keys) {
            const storedUserId = await redisClient.get(key);
            if (storedUserId === userId) {
                await redisClient.del(key);
            }
        }
    }
}
