import type { FastifyInstance } from 'fastify';
import { env } from '../../../infrastructure/config/env.js';

export async function registerOfferDocusignRedirect(fastify: FastifyInstance) {
  fastify.get('/offer/success', async (request, reply) => {
    const q = request.url.includes('?') ? request.url.slice(request.url.indexOf('?')) : '';
    const base = env.FRONTEND_URL.replace(/\/$/, '');
    return reply.code(302).redirect(`${base}/offer/success${q}`);
  });
}
