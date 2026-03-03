import type Stripe from 'stripe';
import type { IHandlePaymentWebhookInput } from '../../../application/company/ports/usecase/IHandlePaymentWebhookUseCase.js';

export const PaymentMapper = {
  toHandlePaymentWebhookInput(paymentIntent: Stripe.PaymentIntent, eventType: IHandlePaymentWebhookInput['eventType']): IHandlePaymentWebhookInput {
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

