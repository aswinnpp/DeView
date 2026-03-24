import type { IHandlePaymentWebhookInput } from '../ports/usecase/IHandlePaymentWebhookUseCase.js';
import type { ICreatePaymentIntentInput } from '../ports/usecase/ICreatePaymentIntentUseCase.js';
import type { IActivatePendingSubscriptionNowInput } from '../ports/usecase/IActivatePendingSubscriptionNowUseCase.js';

/**
 * Plain representation of payment intent data (no Stripe dependency in application layer).
 */
export interface PaymentIntentPayload {
  id: string;
  metadata?: { planId?: string; companyId?: string } | null;
}

export const PaymentMapper = {
  toCreatePaymentIntentInput(
    body: { planId: string },
    user: { companyId?: string }
  ): ICreatePaymentIntentInput {
    return {
      planId: body.planId,
      companyId: user.companyId ?? '',
    };
  },

  toActivatePendingNowInput(
    params: { pendingId: string },
    user: { companyId?: string }
  ): IActivatePendingSubscriptionNowInput {
    return {
      companyId: user.companyId ?? '',
      pendingSubscriptionId: params.pendingId,
    };
  },

  toHandlePaymentWebhookInput(
    paymentIntent: PaymentIntentPayload,
    eventType: IHandlePaymentWebhookInput['eventType']
  ): IHandlePaymentWebhookInput {
    const planId = paymentIntent.metadata?.planId ?? '';
    const companyId = paymentIntent.metadata?.companyId ?? '';
    return {
      eventType,
      paymentIntentId: paymentIntent.id,
      planId,
      companyId,
    };
  },

  toHandlePaymentWebhookInputFromEvent(event: {
    type: string;
    data?: { object?: unknown };
  }): IHandlePaymentWebhookInput | null {
    const eventType =
      event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.payment_failed'
        ? event.type
        : null;
    if (!eventType) return null;

    const object = (event.data?.object ?? {}) as { id?: unknown; metadata?: unknown };
    const paymentIntent: PaymentIntentPayload = {
      id: String(object.id ?? ''),
      metadata:
        object.metadata && typeof object.metadata === 'object'
          ? (object.metadata as { planId?: string; companyId?: string })
          : null,
    };
    return PaymentMapper.toHandlePaymentWebhookInput(paymentIntent, eventType);
  },
};
