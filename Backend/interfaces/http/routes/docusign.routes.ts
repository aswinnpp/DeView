import type { FastifyInstance } from 'fastify';
import { env } from '../../../infrastructure/config/env.js';
import { DocuSignJwtAuthService } from '../../../infrastructure/docusign/DocuSignJwtAuthService.js';

/** Public helpers for DocuSign JWT setup (consent URL). */
export async function docusignPublicRoutes(fastify: FastifyInstance) {
  fastify.get('/consent-url', async (_req, reply) => {
    const svc = DocuSignJwtAuthService.fromEnv(env);
    if (!svc) {
      return reply.status(503).send({
        error: 'DocuSign is not configured',
        hint: 'Set DOCUSIGN_INTEGRATION_KEY, DOCUSIGN_USER_ID, and DOCUSIGN_PRIVATE_KEY in Backend/.env',
      });
    }
    return { url: svc.getConsentUrl() };
  });
}
