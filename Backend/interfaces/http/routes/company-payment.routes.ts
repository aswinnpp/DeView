import type { FastifyInstance, FastifyRequest } from 'fastify';
import { CompanyPaymentController } from '../controllers/company-payment.controller.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export async function companyPaymentRoutes(
  fastify: FastifyInstance,
  controller: CompanyPaymentController,
): Promise<void> {

  console.log("companyPaymentRoutes");
  console.log("fastify", fastify);
  console.log("controller", controller);
  console.log("requireAuth", requireAuth);
  console.log("createPaymentIntent", controller.createPaymentIntent);
  console.log("activatePendingNow", controller.activatePendingNow);
  console.log("handleWebhook", controller.handleWebhook);
  
  fastify.post('/payments/create-intent', {
    preHandler: requireAuth,
    handler: controller.createPaymentIntent,
  });

  fastify.post(
    '/subscriptions/pending/:pendingId/activate-now',
    {
      preHandler: requireAuth,
    },
    (request, reply) =>
      controller.activatePendingNow(
        request as FastifyRequest<{ Params: { pendingId: string } }>,
        reply,
      ),
  );
}

