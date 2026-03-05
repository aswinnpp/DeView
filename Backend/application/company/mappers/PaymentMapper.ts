import type { IHandlePaymentWebhookInput } from '../ports/usecase/IHandlePaymentWebhookUseCase.js';

/**
 * Plain representation of payment intent data (no Stripe dependency in application layer).
 */
export interface PaymentIntentPayload {
  id: string;
  metadata?: { planId?: string; companyId?: string } | null;
}

export const PaymentMapper = {
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
};
