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
    const signature = request.headers['stripe-signature'] as string;
    const rawBody = (request as { rawBody?: Buffer | string })?.rawBody as Buffer | string;

    const event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET as string);

    if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const input = PaymentMapper.toHandlePaymentWebhookInput(
        { id: paymentIntent.id, metadata: paymentIntent.metadata as { planId?: string; companyId?: string } | null },
        event.type
      );
      await this.handlePaymentWebhookUseCase.execute(input);
    }

    return reply.status(200).send({ received: true });
  };
}
