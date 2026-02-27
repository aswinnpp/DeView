import type { FastifyInstance } from 'fastify';
import type { CompanyPaymentController } from '../controllers/company-payment.controller.js';

export async function stripeWebhookRoutes(
  fastify: FastifyInstance,
  controller: CompanyPaymentController,
): Promise<void> {
  // Public Stripe webhook endpoint (no auth). Requires rawBody for signature verification.
  fastify.post(
    '/stripe',
    {
      config: {
        rawBody: true,
      },
    },
    controller.handleWebhook,
  );
}

