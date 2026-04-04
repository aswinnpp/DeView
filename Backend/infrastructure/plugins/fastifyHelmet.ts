import helmet from '@fastify/helmet';
import { FastifyInstance } from 'fastify';
import { getHelmetFrameParticipantSources } from '../config/corsOrigins.js';

export async function registerHelmet(fastify: FastifyInstance): Promise<void> {
    const frameParticipants = getHelmetFrameParticipantSources();

    await fastify.register(helmet, {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                frameSrc: frameParticipants,
                frameAncestors: frameParticipants,
            },
        },
        crossOriginEmbedderPolicy: false,
        frameguard: false,
    });
    fastify.log.info('Security headers (Helmet) registered');
}
