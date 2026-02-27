import { Collection, ObjectId, type Filter } from "mongodb";
import type {
  ICompanyProfileRepository,
  ICompanyProfileSearchOptions,
} from "../../../../application/company/ports/repository/ICompanyProfileRepository";
import {
  CompanyApproval,
  type CompanySubscriptionRecord,
} from "../../../../domain/company/entities/CompanyApprovalEntitie";
import {
  type ICompanyApprovalDocument,
  type ICompanySubscriptionRecord,
} from "../schemas/CompanyApprovalDocument";
import { BaseMongoRepository } from "./BaseMongoRepository";

export class MongoCompanyProfileRepository
  extends BaseMongoRepository<CompanyApproval, ICompanyApprovalDocument>
  implements ICompanyProfileRepository
{
  constructor(collection: Collection<ICompanyApprovalDocument>) {
    super(collection);
  }

  async findByUserId(userId: string): Promise<CompanyApproval | null> {
    const doc = await this.collection.findOne({ userId });
    return doc ? this.toDomain(doc as ICompanyApprovalDocument) : null;
  }

  async findPending(
    options?: ICompanyProfileSearchOptions,
  ): Promise<{ data: CompanyApproval[]; total: number }> {
    const filter: Filter<ICompanyApprovalDocument> = { status: "pending" };
    const { search, sortOrder = "desc", page = 1, limit } = options ?? {};

    if (search && search.trim()) {
      const regex = { $regex: search.trim(), $options: "i" };
      filter.$or = [
        { companyName: regex },
        { contactEmail: regex },
        { contactPerson: regex },
      ];
    }

    const total = await this.collection.countDocuments(filter);
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const cursor = this.collection
      .find(filter)
      .sort({ createdAt: sortDirection, _id: sortDirection });

    if (limit != null && limit > 0) {
      const skip = (Math.max(1, page) - 1) * limit;
      cursor.skip(skip).limit(limit);
    }

    const docs = await cursor.toArray();
    return { data: docs.map((d) => this.toDomain(d as ICompanyApprovalDocument)), total };
  }

  async findApproved(
    options?: ICompanyProfileSearchOptions,
  ): Promise<{ data: CompanyApproval[]; total: number }> {
    const filter: Filter<ICompanyApprovalDocument> = { status: "approved" };
    const { search, sortOrder = "desc", page = 1, limit, status } = options ?? {};

    if (search && search.trim()) {
      const regex = { $regex: search.trim(), $options: "i" };
      filter.$or = [
        { companyName: regex },
        { contactEmail: regex },
        { contactPerson: regex },
      ];
    }

    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;

    const total = await this.collection.countDocuments(filter);
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const cursor = this.collection
      .find(filter)
      .sort({ createdAt: sortDirection, _id: sortDirection });

    if (limit != null && limit > 0) {
      const skip = (Math.max(1, page) - 1) * limit;
      cursor.skip(skip).limit(limit);
    }

    const docs = await cursor.toArray();
    return { data: docs.map((d) => this.toDomain(d as ICompanyApprovalDocument)), total };
  }

  private subscriptionToDomain(
    record: ICompanySubscriptionRecord | null | undefined,
  ): CompanySubscriptionRecord | null {
    if (!record) return null;
    return {
      id: record.id,
      planId: record.planId,
      planName: record.planName,
      price: record.price,
      duration: record.duration,
      startAt: new Date(record.startAt),
      endsAt: new Date(record.endsAt),
      status: record.status,
      createdAt: new Date(record.createdAt),
      sourcePaymentIntentId: record.sourcePaymentIntentId,
    };
  }

  private subscriptionToDocument(
    record: CompanySubscriptionRecord | null | undefined,
  ): ICompanySubscriptionRecord | undefined {
    if (!record) return undefined;
    return {
      id: record.id,
      planId: record.planId,
      planName: record.planName,
      price: record.price,
      duration: record.duration,
      startAt: record.startAt,
      endsAt: record.endsAt,
      status: record.status,
      createdAt: record.createdAt,
      sourcePaymentIntentId: record.sourcePaymentIntentId,
    };
  }

  protected toDomain(doc: ICompanyApprovalDocument): CompanyApproval {
    const active = this.subscriptionToDomain(doc.activeSubscription ?? null);
    const pending = (doc.pendingSubscriptions ?? []).map((r) =>
      this.subscriptionToDomain(r)!,
    );
    const history = (doc.subscriptionHistory ?? []).map((r) =>
      this.subscriptionToDomain(r)!,
    );

    return new CompanyApproval(
      doc._id?.toString() || null,
      doc.userId,
      doc.companyName,
      doc.address,
      doc.contactPerson,
      doc.contactEmail,
      doc.contactPhone,
      doc.taxId,
      doc.numberOfEmployees,
      doc.documents,
      doc.website,
      doc.status,
      doc.rejectionReason,
      doc.isActive ?? true,
      doc.subscriptionPlanId,
      doc.subscriptionEndsAt,
      doc.createdAt,
      doc.updatedAt,
      active,
      pending,
      history,
    );
  }

  protected toDocument(entity: CompanyApproval): ICompanyApprovalDocument {
    const active = this.subscriptionToDocument(entity.activeSubscription);
    const pending =
      entity.pendingSubscriptions && entity.pendingSubscriptions.length > 0
        ? entity.pendingSubscriptions.map((r) => this.subscriptionToDocument(r)!)
        : undefined;
    const history =
      entity.subscriptionHistory && entity.subscriptionHistory.length > 0
        ? entity.subscriptionHistory.map((r) => this.subscriptionToDocument(r)!)
        : undefined;

    return {
      ...(entity.id && { _id: new ObjectId(entity.id) }),
      userId: entity.userId,
      companyName: entity.companyName,
      address: entity.address,
      contactPerson: entity.contactPerson,
      contactEmail: entity.contactEmail,
      contactPhone: entity.contactPhone,
      taxId: entity.taxId,
      numberOfEmployees: entity.numberOfEmployees,
      documents: entity.documents,
      website: entity.website,
      status: entity.status,
      rejectionReason: entity.rejectionReason,
      isActive: entity.isActive,
      subscriptionPlanId: entity.subscriptionPlanId,
      subscriptionEndsAt: entity.subscriptionEndsAt,
      activeSubscription: active ?? undefined,
      pendingSubscriptions: pending,
      subscriptionHistory: history,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
