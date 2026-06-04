export interface IHandlePaymentWebhookInput {
  eventType: 'payment_intent.succeeded' | 'payment_intent.payment_failed';
  paymentIntentId: string;
  planId: string;
  companyId: string;
}

export interface IHandlePaymentWebhookUseCase {
  execute(input: IHandlePaymentWebhookInput): Promise<void>;
}
