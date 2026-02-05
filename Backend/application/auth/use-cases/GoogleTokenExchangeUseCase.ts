import { sessionCache } from '../../../infrastructure/cache/SessionCache.js';

export interface TokenExchangeResponseDTO {
    token: string;
    role: string;
}

export class GoogleTokenExchangeUseCase {
    async execute(sessionId: string): Promise<TokenExchangeResponseDTO> {
        const sessionData = await sessionCache.get(`oauth:session:${sessionId}`);

        if (!sessionData) {
            throw new Error('Session expired or invalid');
        }

        // Delete session (one-time use)
        await sessionCache.del(`oauth:session:${sessionId}`);

        const { token, role } = JSON.parse(sessionData);
        return { token, role };
    }
}
