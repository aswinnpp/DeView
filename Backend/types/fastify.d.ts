import 'fastify';
import { FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
        signRefreshToken: (payload: any) => string;
        verifyRefreshToken: (token: string) => any;
    }
}
