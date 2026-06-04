export type PaymentStatus = 'pending' | 'succeeded' | 'failed';

export class Payment {
  constructor(
    public id: string | null,
    public companyId: string,
    public subscriptionPlanId: string,
    public stripePaymentIntentId: string,
    public amountMinor: number,
    public currency: string,
    public status: PaymentStatus,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  markSucceeded(): void {
    this.status = 'succeeded';
    this.updatedAt = new Date();
  }

  markFailed(): void {
    this.status = 'failed';
    this.updatedAt = new Date();
  }
}
