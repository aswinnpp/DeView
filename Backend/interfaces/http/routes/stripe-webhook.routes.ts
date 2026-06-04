import type { FastifyInstance } from 'fastify';
import type { CompanyPaymentController } from '../controllers/company-payment.controller.js';

export async function stripeWebhookRoutes(
  fastify: FastifyInstance,
  controller: CompanyPaymentController,
): Promise<void> {
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

