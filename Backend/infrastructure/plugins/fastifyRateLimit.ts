import rateLimit from '@fastify/rate-limit';
import { FastifyInstance } from 'fastify';
import { HttpStatus } from '../../shared/http/HttpStatus';

export async function registerRateLimit(fastify: FastifyInstance): Promise<void> {
    await fastify.register(rateLimit, {
        global: true,
        max: 100,
        timeWindow: '15 minutes',
        errorResponseBuilder: (request, context) => {
            return {
                error: 'Too Many Requests',
                message: `Rate limit exceeded. You can make ${context.max} requests per ${context.after}. Try again later.`,
                statusCode: HttpStatus.TOO_MANY_REQUESTS,
            };
        },
    });
    console.log(' Rate limiting registered (100 requests per 15 minutes)');
}
export async function registerAuthRateLimit(fastify: FastifyInstance): Promise<void> {
    await fastify.register(rateLimit, {
        max: 5,
        timeWindow: '1 minute',
        keyGenerator: (request) => {
            const body = request.body as any;
            return body?.email || request.ip;
        },
        errorResponseBuilder: (request, context) => {
            return {
                error: 'Too Many Requests',
                message: 'Too many authentication attempts. Please try again in 1 minute.',
                statusCode: HttpStatus.TOO_MANY_REQUESTS,
            };
        },
    });
    console.log(' Auth rate limiting registered (5 attempts per minute per email/IP)');
}
