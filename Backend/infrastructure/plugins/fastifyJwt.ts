import fastifyJwt from '@fastify/jwt';
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
async function jwtPlugin(fastify: FastifyInstance) {
    await fastify.register(fastifyJwt, {
        secret: process.env.JWT_ACCESS_SECRET!,
        sign: { expiresIn: process.env.ACCESS_TOKEN_TTL },
    });
    fastify.decorate('authenticate', async (request: any, reply: any) => {
        try {
            console.log('📋 Headers:', JSON.stringify(request.headers, null, 2));

            const authHeader = request.headers.authorization;
            if (!authHeader) {
                return reply.status(401).send({ error: 'Unauthorized - No token provided' });
            }
            await request.jwtVerify();
        } catch (err: any) {
            reply.status(401).send({ error: 'Unauthorized - Invalid token' });
        }
    });

    fastify.decorate('signRefreshToken', (payload: any) => {
        return fastify.jwt.sign(payload, {
            expiresIn: process.env.REFRESH_TOKEN_TTL,
        } as any);
    });
}
export default fp(jwtPlugin);
