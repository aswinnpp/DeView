import helmet from '@fastify/helmet';
import { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';

export async function registerHelmet(fastify: FastifyInstance): Promise<void> {
    await fastify.register(helmet, {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                frameSrc: ["'self'", env.FRONTEND_URL],
                frameAncestors: ["'self'", env.FRONTEND_URL],
            },
        },
        crossOriginEmbedderPolicy: false,
        frameguard: false,
    });
    console.log('Security headers (Helmet) registered');
}
