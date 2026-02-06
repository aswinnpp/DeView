import { redisClient } from '../../../infrastructure/cache/RedisClient.js';

export interface TokenExchangeResponseDTO {
    token: string;
    role: string;
}

export class GoogleTokenExchangeUseCase {
    async execute(sessionId: string): Promise<TokenExchangeResponseDTO> {
        const sessionData = await redisClient.get(`oauth:session:${sessionId}`);

        if (!sessionData) {
            throw new Error('Session expired or invalid');
        }

        // Delete session (one-time use)
        await redisClient.del(`oauth:session:${sessionId}`);

        const { token, role } = JSON.parse(sessionData);
        return { token, role };
    }
}

