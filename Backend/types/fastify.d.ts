import 'fastify';

declare module 'fastify' {
    interface FastifyInstance {
        signRefreshToken: (payload: any) => string;
    }
}
