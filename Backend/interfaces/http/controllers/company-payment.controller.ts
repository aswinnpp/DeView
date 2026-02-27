import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'inversify';

import { stripe } from '../../../infrastructure/payments/stripeClient.js';
import { TYPES } from '../../../infrastructure/di/types.js';
import type { ICreatePaymentIntentUseCase } from '../../../application/company/ports/usecase/ICreatePaymentIntentUseCase.js';
import type { IHandlePaymentWebhookUseCase } from '../../../application/company/ports/usecase/IHandlePaymentWebhookUseCase.js';
import type { IActivatePendingSubscriptionNowUseCase } from '../../../application/company/ports/usecase/IActivatePendingSubscriptionNowUseCase.js';
import { success } from '../../../shared/http/apiResponse.js';
import { HttpStatus } from '../../../shared/http/HttpStatus.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { env } from '../../../infrastructure/config/env.js';
import type Stripe from 'stripe';

type CreatePaymentIntentBody = {
  planId: string;
};

type ActivatePendingNowParams = {
  pendingId: string;
};

@injectable()
export class CompanyPaymentController {
  constructor(
    @inject(TYPES.CreatePaymentIntentUseCasePort) private readonly createPaymentIntentUseCase: ICreatePaymentIntentUseCase,
    @inject(TYPES.HandlePaymentWebhookUseCasePort) private readonly handlePaymentWebhookUseCase: IHandlePaymentWebhookUseCase,
    @inject(TYPES.ActivatePendingSubscriptionNowUseCasePort)
    private readonly activatePendingSubscriptionNowUseCase: IActivatePendingSubscriptionNowUseCase,
  ) {}

  createPaymentIntent = async (
    request: FastifyRequest<{ Body: CreatePaymentIntentBody }>,
    reply: FastifyReply,
  ) => {
    const { planId } = request.body;
    const user = request.currentUser;

    if (!user.companyId) {
      throw AppError.forbidden('Company id missing on user');
    }

    const result = await this.createPaymentIntentUseCase.execute({
      companyId: user.companyId,
      planId,
    });

    return reply.status(HttpStatus.OK).send(success({ clientSecret: result.clientSecret }));
  };

  activatePendingNow = async (
    request: FastifyRequest<{ Params: ActivatePendingNowParams }>,
    reply: FastifyReply,
  ) => {
    const user = request.currentUser;
    if (!user.companyId) {
      throw AppError.forbidden('Company id missing on user');
    }

    const { pendingId } = request.params;

    await this.activatePendingSubscriptionNowUseCase.execute({
      companyId: user.companyId,
      pendingSubscriptionId: pendingId,
    });

    return reply.status(HttpStatus.OK).send(success({}));
  };

  handleWebhook = async (request: FastifyRequest, reply: FastifyReply) => {
    const signature = request.headers['stripe-signature'];

    if (!signature) {
      request.log.error('Stripe webhook missing signature header');
      return reply.status(400).send('Missing Stripe signature');
    }

    if (!env.STRIPE_WEBHOOK_SECRET) {
      request.log.error('STRIPE_WEBHOOK_SECRET is not configured');
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    const rawBody = (request as { rawBody?: Buffer | string })?.rawBody;

    if (!rawBody) {
      request.log.error('Stripe webhook received without raw body');
      return reply.status(400).send('Raw body is required');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody as Buffer | string,
        signature as string,
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      request.log.error({ err, signature }, 'Stripe webhook signature verification failed');
      return reply.status(400).send(`Webhook Error: ${message}`);
    }

    if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const planId = paymentIntent.metadata?.planId ?? '';
      const companyId = paymentIntent.metadata?.companyId ?? '';

      try {
        await this.handlePaymentWebhookUseCase.execute({
          eventType: event.type,
          paymentIntentId: paymentIntent.id,
          planId,
          companyId,
        });
      } catch (err) {
        request.log.error({ err, paymentIntentId: paymentIntent.id }, 'Handle payment webhook failed');
        if (err instanceof AppError && err.statusCode === 404) {
          return reply.status(200).send({ received: true });
        }
        throw err;
      }
    }

    return reply.status(200).send({ received: true });
  };
}
