import type { FastifyInstance } from 'fastify';
import { env } from '../../../infrastructure/config/env.js';

export async function registerOfferDocusignRedirect(fastify: FastifyInstance) {
  fastify.get('/offer/success', async (request, reply) => {
    const q = request.url.includes('?') ? request.url.slice(request.url.indexOf('?')) : '';
    const base = env.FRONTEND_URL.replace(/\/$/, '');
    /** After consent, DocuSign hits this backend URL first; forward to the SPA. HR-only installs may use `/hr/offer-letters` instead. */
    return reply.code(302).redirect(`${base}/company/offer-letters${q}`);
  });
}
