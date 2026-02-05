import helmet from '@fastify/helmet';
import { FastifyInstance } from 'fastify';
export async function registerHelmet(fastify: FastifyInstance): Promise<void> {
    await fastify.register(helmet, {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
            },
        },
        crossOriginEmbedderPolicy: false,
    });
    console.log('✅ Security headers (Helmet) registered');
}
