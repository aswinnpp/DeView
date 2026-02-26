import { ObjectId } from 'mongodb';

export type PaymentStatus = 'pending' | 'succeeded' | 'failed';

export interface IPaymentDocument {
  _id?: ObjectId;
  companyId: string;
  subscriptionPlanId: string;
  stripePaymentIntentId: string;
  amountMinor: number;
  currency: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}
