import fastifyJwt from '@fastify/jwt';
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';


async function jwtPlugin(fastify: FastifyInstance) {
    await fastify.register(fastifyJwt, {
        secret: process.env.JWT_ACCESS_SECRET!,
        sign: { expiresIn: process.env.ACCESS_TOKEN_TTL },
    });

    fastify.decorate('signRefreshToken', (payload: any) => {
        return fastify.jwt.sign(payload, {
            expiresIn: process.env.REFRESH_TOKEN_TTL,
        } as any);
    });
}

export default fp(jwtPlugin);
