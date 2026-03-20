import { Collection, ObjectId } from 'mongodb';
import { BaseMongoRepository } from './BaseMongoRepository.js';
import { Payment } from '../../../../domain/entities/Payment.js';
import type { IPaymentRepository } from '../../../../application/company/ports/repository/IPaymentRepository.js';
import type { IPaymentDocument } from '../schemas/payment.js';

export class MongoPaymentRepository
  extends BaseMongoRepository<Payment, IPaymentDocument>
  implements IPaymentRepository {
  constructor(collection: Collection<IPaymentDocument>) {
    super(collection);
  }

  async findByStripePaymentIntentId(stripePaymentIntentId: string): Promise<Payment | null> {
    const doc = await this.collection.findOne({ stripePaymentIntentId });
    return doc ? this.toDomain(doc as IPaymentDocument) : null;
  }

  protected toDomain(doc: IPaymentDocument): Payment {
    return new Payment(
      doc._id?.toString() ?? null,
      doc.companyId,
      doc.subscriptionPlanId,
      doc.stripePaymentIntentId,
      doc.amountMinor,
      doc.currency,
      doc.status,
      doc.createdAt,
      doc.updatedAt,
    );
  }

  protected toDocument(entity: Payment): IPaymentDocument {
    return {
      ...(entity.id && { _id: new ObjectId(entity.id) }),
      companyId: entity.companyId,
      subscriptionPlanId: entity.subscriptionPlanId,
      stripePaymentIntentId: entity.stripePaymentIntentId,
      amountMinor: entity.amountMinor,
      currency: entity.currency,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
