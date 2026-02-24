import { Collection, ObjectId } from "mongodb";
import type { ICompanyProfileRepository, ICompanyProfileSearchOptions } from "../../../../application/company/ports/repository/ICompanyProfileRepository";
import { CompanyApproval } from "../../../../domain/company/entities/CompanyApprovalEntitie";
import { ICompanyApprovalDocument } from "../schemas/CompanyApprovalDocument";
import { BaseMongoRepository } from "./BaseMongoRepository";

export class MongoCompanyProfileRepository
  extends BaseMongoRepository<CompanyApproval>
  implements ICompanyProfileRepository {
  constructor(collection: Collection<ICompanyApprovalDocument>) {
    super(collection);
  }

  async findByUserId(userId: string): Promise<CompanyApproval | null> {
    const doc = await this.collection.findOne({ userId });
    return doc ? this.toDomain(doc as ICompanyApprovalDocument) : null;
  }

  async findPending(options?: ICompanyProfileSearchOptions): Promise<{ data: CompanyApproval[]; total: number }> {
    const filter: Record<string, any> = { status: "pending" };
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
    return { data: docs.map(d => this.toDomain(d as ICompanyApprovalDocument)), total };
  }

  async findApproved(options?: ICompanyProfileSearchOptions): Promise<{ data: CompanyApproval[]; total: number }> {
    const filter: Record<string, any> = { status: "approved" };
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
    return { data: docs.map(d => this.toDomain(d as ICompanyApprovalDocument)), total };
  }

  protected toDomain(doc: ICompanyApprovalDocument): CompanyApproval {
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
      doc.createdAt,
      doc.updatedAt
    );
  }

  protected toDocument(entity: CompanyApproval): ICompanyApprovalDocument {
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
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }
}
