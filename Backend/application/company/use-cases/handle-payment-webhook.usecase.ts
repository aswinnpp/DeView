import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IHandlePaymentWebhookUseCase, IHandlePaymentWebhookInput } from '../ports/usecase/IHandlePaymentWebhookUseCase.js';
import type { IPaymentRepository } from '../ports/repository/IPaymentRepository.js';
import type { ICompanyProfileRepository } from '../ports/repository/ICompanyProfileRepository.js';
import type { ISubscribtionRepository } from '../../admin/ports/repository/ISubscribtionRepository.js';
import { AppError } from '../../../shared/errors/AppError.js';

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function subscriptionEndsAt(duration: 'Monthly' | 'Quarterly' | 'Annual'): Date {
  const now = new Date();
  switch (duration) {
    case 'Monthly':
      return addMonths(now, 1);
    case 'Quarterly':
      return addMonths(now, 3);
    case 'Annual':
      return addMonths(now, 12);
    default:
      return addMonths(now, 1);
  }
}

@injectable()
export class HandlePaymentWebhookUseCase implements IHandlePaymentWebhookUseCase {
  constructor(
    @inject(TYPES.PaymentRepositoryPort) private readonly paymentRepository: IPaymentRepository,
    @inject(TYPES.CompanyProfileRepositoryPort) private readonly companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.SubscribtionRepositoryPort) private readonly subscriptionRepository: ISubscribtionRepository,
  ) {}

  async execute(input: IHandlePaymentWebhookInput): Promise<void> {
    const { eventType, paymentIntentId, planId, companyId } = input;

    const payment = await this.paymentRepository.findByStripePaymentIntentId(paymentIntentId);
    if (!payment) {
      throw AppError.notFound(`Payment not found for intent ${paymentIntentId}`);
    }

    if (eventType === 'payment_intent.succeeded') {
      payment.markSucceeded();
      await this.paymentRepository.save(payment);

      const company = await this.companyProfileRepository.findById(companyId);
      if (company) {
        const plan = await this.subscriptionRepository.findById(planId);
        const endsAt = plan ? subscriptionEndsAt(plan.duration) : addMonths(new Date(), 1);
        company.setSubscription(planId, endsAt);
        await this.companyProfileRepository.save(company);
      }
    } else if (eventType === 'payment_intent.payment_failed') {
      payment.markFailed();
      await this.paymentRepository.save(payment);
    }
  }
}
