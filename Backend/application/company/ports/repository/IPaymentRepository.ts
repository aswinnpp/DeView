import { Payment } from '../../../../domain/entities/Payment.js';

export interface IPaymentRepository {
  save(payment: Payment): Promise<void>;
  findByStripePaymentIntentId(stripePaymentIntentId: string): Promise<Payment | null>;
}
