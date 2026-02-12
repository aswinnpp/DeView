import fastifyJwt from '@fastify/jwt';
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { RedisAccessTokenRepository } from '../persistence/redis/RedisAccessTokenRepository.js';

const accessTokenRepo = new RedisAccessTokenRepository();

async function jwtPlugin(fastify: FastifyInstance) {
    await fastify.register(fastifyJwt, {
        secret: process.env.JWT_ACCESS_SECRET!,
        sign: { expiresIn: process.env.ACCESS_TOKEN_TTL },
    });
    fastify.decorate('authenticate', async (request: any, reply: any) => {
        try {
            let authHeader = request.headers.authorization;

            // If no Authorization header, try accessToken cookie
            if (!authHeader) {
                const cookies = request.headers.cookie || '';
                const match = cookies.match(/accessToken=([^;]+)/);
                if (match) {
                    authHeader = `Bearer ${match[1].trim()}`;
                    request.headers.authorization = authHeader;
                }
            }

            if (!authHeader) {
                return reply.status(401).send({ error: 'Unauthorized - Please login first' });
            }

            await request.jwtVerify();

            // Check Redis - token must be stored (not revoked)
            const jti = (request.user as any)?.jti;
            if (jti) {
                const exists = await accessTokenRepo.exists(jti);
                if (!exists) {
                    return reply.status(401).send({ error: 'Unauthorized - Please login first' });
                }
            }
        } catch (err: any) {
            reply.status(401).send({ error: 'Unauthorized - Please login first' });
        }
    });

    fastify.decorate('signRefreshToken', (payload: any) => {
        return fastify.jwt.sign(payload, {
            expiresIn: process.env.REFRESH_TOKEN_TTL,
        } as any);
    });
}
export default fp(jwtPlugin);
