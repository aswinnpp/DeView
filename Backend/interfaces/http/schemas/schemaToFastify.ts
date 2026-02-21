import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ZodType } from 'zod';
import { toJSONSchema } from 'zod';

/** Use input shape so schemas with .transform() don't throw; we validate what the client sends. */
const JSON_SCHEMA_OPTS = { io: 'input' as const };

/** Convert Shared Zod schema to Fastify body JSON Schema. Reuse everywhere instead of calling toJSONSchema inline. */
export function zodToFastifyBody<T extends ZodType>(zodSchema: T): object {
    const schema = toJSONSchema(zodSchema, JSON_SCHEMA_OPTS) as Record<string, unknown>;
    delete schema.$schema;
    return schema as object;
}

/** Convert Shared Zod schema to Fastify params JSON Schema. Reuse everywhere instead of calling toJSONSchema inline. */
export function zodToFastifyParams<T extends ZodType>(zodSchema: T): object {
    const schema = toJSONSchema(zodSchema, JSON_SCHEMA_OPTS) as Record<string, unknown>;
    delete schema.$schema;
    return schema as object;
}

/** Run full Zod schema (including transform) on body and assign back. Use only when the Shared schema has .transform() so the controller gets the transformed value. */
export function zodParseBody<T>(schema: ZodType<T>) {
    return async function (request: FastifyRequest, _reply: FastifyReply) {
        request.body = schema.parse(request.body) as FastifyRequest['body'];
    };
}
