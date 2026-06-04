import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { ICreatePaymentIntentUseCase, ICreatePaymentIntentInput, ICreatePaymentIntentResult } from '../ports/usecase/ICreatePaymentIntentUseCase.js';
import type { ISubscriptionRepository } from '../../admin/ports/repository/ISubscriptionRepository.js';
import type { IPaymentRepository } from '../ports/repository/IPaymentRepository.js';
import { stripe } from '../../../infrastructure/payments/stripeClient.js';
import { env } from '../../../infrastructure/config/env.js';
import { Payment } from '../../../domain/entities/Payment.js';
import { AppError } from '../../../shared/errors/AppError.js';

@injectable()
export class CreatePaymentIntentUseCase implements ICreatePaymentIntentUseCase {
  constructor(
    @inject(TYPES.SubscriptionRepositoryPort) private readonly _subscriptionRepository: ISubscriptionRepository,
    @inject(TYPES.PaymentRepositoryPort) private readonly _paymentRepository: IPaymentRepository,
  ) {}

  async execute(input: ICreatePaymentIntentInput): Promise<ICreatePaymentIntentResult> {
    const { companyId, planId } = input;

    if (!companyId?.trim()) {
      throw AppError.badRequest('Company id is required');
    }
    if (!planId?.trim()) {
      throw AppError.badRequest('Plan id is required');
    }

    const plan = await this._subscriptionRepository.findById(planId);
    if (!plan || !plan.isActive) {
      throw AppError.notFound('Subscription plan not found or inactive');
    }

    const amountMinor = plan.price * 100;
    const currency = env.STRIPE_CURRENCY ?? 'inr';

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountMinor,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        planId: plan.id ?? '',
        companyId,
      },
    });

    if (!paymentIntent.client_secret) {
      throw new Error('Stripe did not return a client secret');
    }

    const payment = new Payment(
      null,
      companyId,
      planId,
      paymentIntent.id,
      amountMinor,
      currency,
      'pending',
      new Date(),
      new Date(),
    );
    await this._paymentRepository.save(payment);

    return { clientSecret: paymentIntent.client_secret };
  }
}
