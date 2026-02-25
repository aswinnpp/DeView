import 'fastify';
import type { IRefreshTokenPayload } from '../application/auth/ports/services/ITokenService';

declare module 'fastify' {
    interface FastifyInstance {
        signRefreshToken: (payload: IRefreshTokenPayload) => string;
    }
}
