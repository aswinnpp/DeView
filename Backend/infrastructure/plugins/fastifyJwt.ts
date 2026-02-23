import fastifyJwt from '@fastify/jwt';
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';


async function jwtPlugin(fastify: FastifyInstance) {
    await fastify.register(fastifyJwt, {
        secret: env.JWT_ACCESS_SECRET,
        sign: { expiresIn: env.ACCESS_TOKEN_TTL },
    });

    fastify.decorate('signRefreshToken', (payload: any) => {
        return fastify.jwt.sign(payload, {
            expiresIn: env.REFRESH_TOKEN_TTL,
        } as any);
    });
}

export default fp(jwtPlugin);
