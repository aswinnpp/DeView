import helmet from '@fastify/helmet';
import { FastifyInstance } from 'fastify';
import { getHelmetFrameParticipantSources } from '../config/corsOrigins.js';

export async function registerHelmet(fastify: FastifyInstance): Promise<void> {
    const frameParticipants = getHelmetFrameParticipantSources();

    await fastify.register(helmet, {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                baseUri: ["'self'"],
                objectSrc: ["'none'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'", 'https://js.stripe.com'],
                scriptSrcElem: ["'self'", 'https://js.stripe.com'],
                imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
                fontSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'", 'https://api.stripe.com', 'https://r.stripe.com'],
                frameSrc: [...frameParticipants, 'https://js.stripe.com', 'https://hooks.stripe.com'],
                frameAncestors: frameParticipants,
                workerSrc: ["'self'", 'blob:'],
            },
        },
        crossOriginEmbedderPolicy: false,
        frameguard: false,
    });
    fastify.log.info('Security headers (Helmet) registered');
}
