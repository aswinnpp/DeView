import { Collection, ObjectId } from "mongodb";
import { CompanyApprovalRepository } from "../../../../domain/company/repositories/CompanyApprovalRepository";
import { CompanyApproval } from "../../../../domain/company/entities/CompanyApprovalEntitie";
import { CompanyApprovalDocument } from "../schemas/CompanyApprovalDocument";

export class MongoCompanyApprovalRepository implements CompanyApprovalRepository {
  constructor(private collection: Collection<CompanyApprovalDocument>) { }

  async findById(id: string): Promise<CompanyApproval | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    return doc ? this.toDomain(doc) : null;
  }

  async findByUserId(userId: string): Promise<CompanyApproval | null> {
    const doc = await this.collection.findOne({ userId });
    return doc ? this.toDomain(doc) : null;
  }

  async findPending(): Promise<CompanyApproval[]> {
    const docs = await this.collection.find({ status: "pending" }).toArray();
    return docs.map(d => this.toDomain(d));
  }

  async findApproved(): Promise<CompanyApproval[]> {
    const docs = await this.collection.find({ status: "approved" }).toArray();
    return docs.map(d => this.toDomain(d));
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
