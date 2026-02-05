import { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../../shared/errors/AppError.js';
import { DomainError } from '../../shared/errors/DomainError.js';
import { ConflictError } from '../../shared/errors/ConflictError.js';
import { ValidationError } from '../../shared/errors/ValidationError.js';

export function registerErrorHandler(fastify: FastifyInstance): void {
    fastify.setErrorHandler((error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) => {
        console.error('❌ Error:', error);

        if (error instanceof AppError) {
            return reply.code(error.statusCode).send({
                error: error.code,
                message: error.message,
            });
        }

        if (error instanceof ConflictError) {
            return reply.code(409).send({
                error: 'CONFLICT',
                message: error.message,
            });
        }

        if (error instanceof ValidationError) {
            return reply.code(400).send({
                error: 'VALIDATION_ERROR',
                message: error.message,
            });
        }

        if (error instanceof DomainError) {
            return reply.code(400).send({
                error: 'DOMAIN_ERROR',
                message: error.message,
            });
        }

        const fastifyError = error as FastifyError;
        if (fastifyError.statusCode) {
            return reply.code(fastifyError.statusCode).send({
                error: fastifyError.code || 'ERROR',
                message: fastifyError.message,
            });
        }

        return reply.code(500).send({
            error: 'INTERNAL_ERROR',
            message: 'Internal server error',
        });
    });
}
