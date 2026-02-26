import type { FastifyInstance } from 'fastify';
import { CompanyPaymentController } from '../controllers/company-payment.controller.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export async function companyPaymentRoutes(
  fastify: FastifyInstance,
  controller: CompanyPaymentController,
): Promise<void> {
  fastify.post('/payments/create-intent', {
    preHandler: requireAuth,
    handler: controller.createPaymentIntent,
  });

  fastify.post(
    '/payments/webhook/stripe',
    {
      config: {
        rawBody: true,
      },
    },
    controller.handleWebhook,
  );
}

