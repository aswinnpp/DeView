import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'inversify';

import { stripe } from '../../../infrastructure/payments/stripeClient.js';
import { TYPES } from '../../../infrastructure/di/types.js';
import type { ICreatePaymentIntentUseCase } from '../../../application/company/ports/usecase/ICreatePaymentIntentUseCase.js';
import type { IHandlePaymentWebhookUseCase } from '../../../application/company/ports/usecase/IHandlePaymentWebhookUseCase.js';
import type { IActivatePendingSubscriptionNowUseCase } from '../../../application/company/ports/usecase/IActivatePendingSubscriptionNowUseCase.js';
import { success } from '../../../shared/http/apiResponse.js';
import { HttpStatus } from '../../../shared/http/HttpStatus.js';
import { env } from '../../../infrastructure/config/env.js';
import { PaymentMapper } from '../../../application/company/mappers/PaymentMapper.js';

type CreatePaymentIntentBody = {
  planId: string;
};

type ActivatePendingNowParams = {
  pendingId: string;
};

@injectable()
export class CompanyPaymentController {
  constructor(
    @inject(TYPES.CreatePaymentIntentUseCasePort) private readonly _createPaymentIntentUseCase: ICreatePaymentIntentUseCase,
    @inject(TYPES.HandlePaymentWebhookUseCasePort) private readonly _handlePaymentWebhookUseCase: IHandlePaymentWebhookUseCase,
    @inject(TYPES.ActivatePendingSubscriptionNowUseCasePort)
    private readonly activatePendingSubscriptionNowUseCase: IActivatePendingSubscriptionNowUseCase,
  ) {}

  createPaymentIntent = async (
    request: FastifyRequest<{ Body: CreatePaymentIntentBody }>,
    reply: FastifyReply,
  ) => {
    const input = PaymentMapper.toCreatePaymentIntentInput(request.body, request.currentUser);
    const result = await this._createPaymentIntentUseCase.execute(input);

    return reply.status(HttpStatus.OK).send(success({ clientSecret: result.clientSecret }));
  };

  activatePendingNow = async (
    request: FastifyRequest<{ Params: ActivatePendingNowParams }>,
    reply: FastifyReply,
  ) => {
    const input = PaymentMapper.toActivatePendingNowInput(request.params, request.currentUser);
    await this.activatePendingSubscriptionNowUseCase.execute(input);

    return reply.status(HttpStatus.OK).send(success({}));
  };

  handleWebhook = async (request: FastifyRequest, reply: FastifyReply) => {
    const signature = request.headers['stripe-signature'];
    if (!signature || typeof signature !== 'string') {
      request.log.warn('Stripe webhook: missing stripe-signature header');
      return reply.status(400).send({ error: 'Missing stripe-signature' });
    }

    const rawBody = (request as { rawBody?: Buffer | string }).rawBody;
    if (rawBody === undefined || rawBody === null) {
      request.log.error(
        { url: request.url },
        'Stripe webhook: rawBody missing (fastify-raw-body must run for POST /webhooks/stripe)',
      );
      return reply.status(500).send({ error: 'Webhook body not captured' });
    }

    const secret = env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      request.log.error('Stripe webhook: STRIPE_WEBHOOK_SECRET is not set');
      return reply.status(500).send({ error: 'Webhook not configured' });
    }

    const payload = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody), 'utf8');

    let event: ReturnType<typeof stripe.webhooks.constructEvent>;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      request.log.warn({ errMsg: msg }, 'Stripe webhook: signature verification failed');
      return reply.status(400).send({ error: 'Invalid signature' });
    }

    const input = PaymentMapper.toHandlePaymentWebhookInputFromEvent(event);
    try {
      await (input ? this._handlePaymentWebhookUseCase.execute(input) : Promise.resolve());
    } catch (err) {
      request.log.error({ err }, 'Stripe webhook: handler error');
      return reply.status(500).send({ error: 'Webhook handler failed' });
    }

    return reply.status(200).send({ received: true });
  };
}
