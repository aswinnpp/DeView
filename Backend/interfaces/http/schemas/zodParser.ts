import type { ZodSchema } from 'zod';
import type { FastifyRequest, FastifyReply } from 'fastify';

/**
 * PreHandler that validates and normalizes request.body with Zod.
 * Runs schema.parse() so transforms (e.g. .trim()) are applied.
 */
export function zodBodyParser<T>(schema: ZodSchema<T>) {
  return async function (request: FastifyRequest, _reply: FastifyReply) {
    request.body = schema.parse(request.body) as FastifyRequest['body'];
  };
}

/**
 * PreHandler that validates and normalizes request.params with Zod.
 */
export function zodParamsParser<T>(schema: ZodSchema<T>) {
  return async function (request: FastifyRequest, _reply: FastifyReply) {
    request.params = schema.parse(request.params) as FastifyRequest['params'];
  };
}
