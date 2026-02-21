import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ZodType } from 'zod';
import { toJSONSchema } from 'zod';

const JSON_SCHEMA_OPTS = { io: 'input' as const };

export function zodToFastifyBody<T extends ZodType>(zodSchema: T): object {
    const schema = toJSONSchema(zodSchema, JSON_SCHEMA_OPTS) as Record<string, unknown>;
    delete schema.$schema;
    return schema as object;
}

export function zodToFastifyParams<T extends ZodType>(zodSchema: T): object {
    const schema = toJSONSchema(zodSchema, JSON_SCHEMA_OPTS) as Record<string, unknown>;
    delete schema.$schema;
    return schema as object;
}

export function zodParseBody<T>(schema: ZodType<T>) {
    return async function (request: FastifyRequest, _reply: FastifyReply) {
        request.body = schema.parse(request.body) as FastifyRequest['body'];
    };
}
