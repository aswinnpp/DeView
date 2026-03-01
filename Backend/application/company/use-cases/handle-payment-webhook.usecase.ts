import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type {
  IHandlePaymentWebhookUseCase,
  IHandlePaymentWebhookInput,
} from '../ports/usecase/IHandlePaymentWebhookUseCase.js';
import type { IPaymentRepository } from '../ports/repository/IPaymentRepository.js';
import type { ICompanyProfileRepository } from '../ports/repository/ICompanyProfileRepository.js';
import type { ISubscriptionRepository } from '../../admin/ports/repository/ISubscriptionRepository.js';
import { AppError } from '../../../shared/errors/AppError.js';

@injectable()
export class HandlePaymentWebhookUseCase implements IHandlePaymentWebhookUseCase {
  constructor(
    @inject(TYPES.PaymentRepositoryPort)
    private readonly paymentRepository: IPaymentRepository,
    @inject(TYPES.CompanyProfileRepositoryPort)
    private readonly companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.SubscriptionRepositoryPort)
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(input: IHandlePaymentWebhookInput): Promise<void> {
    const { eventType, paymentIntentId, planId, companyId } = input;

    const payment = await this.paymentRepository.findByStripePaymentIntentId(paymentIntentId);
    if (!payment) {
      throw AppError.notFound(`Payment not found for intent ${paymentIntentId}`);
    }

    if (eventType === 'payment_intent.succeeded') {
      // Idempotency: do not reprocess already completed payments
      if (payment.status === 'succeeded' || payment.status === 'failed') {
        return;
      }

      payment.markSucceeded();
      await this.paymentRepository.save(payment);

      const company = await this.companyProfileRepository.findById(companyId);
      if (!company) {
        return;
      }

      const plan = await this.subscriptionRepository.findById(planId);
      if (!plan) {
        return;
      }

      const now = new Date();
      company.addPurchasedPlanAsActiveOrPending(
        {
          planId: plan.id ?? planId,
          planName: plan.name,
          price: plan.price,
          duration: plan.duration,
          sourcePaymentIntentId: paymentIntentId,
        },
        now,
      );
      await this.companyProfileRepository.save(company);
    } else if (eventType === 'payment_intent.payment_failed') {
      if (payment.status === 'failed') {
        return;
      }
      payment.markFailed();
      await this.paymentRepository.save(payment);
    }
  }
}
