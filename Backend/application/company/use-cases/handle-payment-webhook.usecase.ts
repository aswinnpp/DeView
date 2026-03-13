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
    private readonly _paymentRepository: IPaymentRepository,
    @inject(TYPES.CompanyProfileRepositoryPort)
    private readonly _companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.SubscriptionRepositoryPort)
    private readonly _subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(input: IHandlePaymentWebhookInput): Promise<void> {
    const { eventType, paymentIntentId } = input;

    const payment = await this._paymentRepository.findByStripePaymentIntentId(paymentIntentId);
    if (!payment) {
      throw AppError.notFound(`Payment not found for intent ${paymentIntentId}`);
    }

    // Prefer companyId/planId from Payment record (stored at create time) - more reliable than Stripe metadata
    const companyId = payment.companyId || input.companyId;
    const planId = payment.subscriptionPlanId || input.planId;

    if (eventType === 'payment_intent.succeeded') {
      // Idempotency: do not reprocess already completed payments
      if (payment.status === 'succeeded' || payment.status === 'failed') {
        return;
      }

      payment.markSucceeded();
      await this._paymentRepository.save(payment);

      if (!companyId?.trim()) {
        return;
      }

      const company = await this._companyProfileRepository.findById(companyId);
      if (!company) {
        return;
      }

      const plan = await this._subscriptionRepository.findById(planId);
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
          interviewLimit: plan.interviewLimit,
          interviewUnlimited: plan.interviewUnlimited,
          jobPostLimit: plan.jobPostLimit,
          jobUnlimited: plan.jobUnlimited,
        },
        now,
      );
      await this._companyProfileRepository.save(company);
    } else if (eventType === 'payment_intent.payment_failed') {
      if (payment.status === 'failed') {
        return;
      }
      payment.markFailed();
      await this._paymentRepository.save(payment);
    }
  }
}
