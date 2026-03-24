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
    const signature = request.headers['stripe-signature'] as string;
    const rawBody = (request as { rawBody?: Buffer | string })?.rawBody as Buffer | string;

   

    const event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET as string);
    const input = PaymentMapper.toHandlePaymentWebhookInputFromEvent(event);
    await (input ? this._handlePaymentWebhookUseCase.execute(input) : Promise.resolve());

    return reply.status(200).send({ received: true });
  };
}
