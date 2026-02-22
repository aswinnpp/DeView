import { Collection, ObjectId } from "mongodb";
import type { CompanyProfileRepositoryPort, CompanyProfileSearchOptions } from "../../../../application/company/ports/repository/CompanyProfileRepositoryPort";
import { CompanyApproval } from "../../../../domain/company/entities/CompanyApprovalEntitie";
import { CompanyApprovalDocument } from "../schemas/CompanyApprovalDocument";

export class MongoCompanyProfileRepository implements CompanyProfileRepositoryPort {
  constructor(private collection: Collection<CompanyApprovalDocument>) { }

  async findById(id: string): Promise<CompanyApproval | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    return doc ? this.toDomain(doc) : null;
  }

  async findByUserId(userId: string): Promise<CompanyApproval | null> {
    const doc = await this.collection.findOne({ userId });
    return doc ? this.toDomain(doc) : null;
  }

  async findPending(options?: CompanyProfileSearchOptions): Promise<{ data: CompanyApproval[]; total: number }> {
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
    return { data: docs.map(d => this.toDomain(d)), total };
  }

  async findApproved(options?: CompanyProfileSearchOptions): Promise<{ data: CompanyApproval[]; total: number }> {
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
    return { data: docs.map(d => this.toDomain(d)), total };
  }

  async save(approval: CompanyApproval): Promise<void> {
    const doc = this.toDocument(approval);

    if (!approval.id) {
      await this.collection.insertOne(doc);
      return;
    }

    const { _id, ...update } = doc;

    await this.collection.updateOne(
      { _id },
      { $set: update }
    );
  }




  private toDomain(doc: CompanyApprovalDocument): CompanyApproval {
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

  private toDocument(entity: CompanyApproval): CompanyApprovalDocument {
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
