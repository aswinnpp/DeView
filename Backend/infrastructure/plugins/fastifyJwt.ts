import fastifyJwt from '@fastify/jwt';
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';
import type { IRefreshTokenPayload } from '../../application/auth/ports/services/ITokenService';

export interface JwtPluginOptions {
  accessTokenCookieName?: string;
}

async function jwtPlugin(fastify: FastifyInstance, opts: JwtPluginOptions) {
    const cookieName = opts.accessTokenCookieName ?? 'userAccessToken';

    await fastify.register(fastifyJwt, {
        secret: env.JWT_ACCESS_SECRET,
        sign: { expiresIn: env.ACCESS_TOKEN_TTL },
        verify: {
            extractToken: (request) => request.cookies?.[cookieName],
        },
    });

    fastify.decorate('signRefreshToken', (payload: IRefreshTokenPayload) => {
        return fastify.jwt.sign(payload, {
            expiresIn: env.REFRESH_TOKEN_TTL,
        });
    });
}

export default fp(jwtPlugin);
