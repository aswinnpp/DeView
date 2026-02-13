import { CompanyStatus } from "../value-objects/CompanyStatus";
import { DomainError } from "../../../shared/errors/DomainError";

export class CompanyApproval {
  constructor(
    public id: string | null,
    public userId: string,
    public companyName: string,
    public address: string,
    public contactPerson: string,
    public contactEmail: string,
    public contactPhone: string,
    public taxId: string,
    public numberOfEmployees: string,
    public documents: Record<string, any>,
    public website?: string,
    public status: CompanyStatus = "pending",
    public rejectionReason?: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) { }

  approve() {
    if (this.status !== "pending") {
      throw new DomainError("Only pending companies can be approved");
    }

    this.status = "approved";
    this.updatedAt = new Date();
  }

  reject(reason: string) {
    if (this.status !== "pending") {
      throw new DomainError("Only pending companies can be rejected");
    }

    if (!reason.trim()) {
      throw new DomainError("Rejection reason required");
    }

    this.status = "rejected";
    this.rejectionReason = reason;
    this.updatedAt = new Date();
  }

  markDocument(documentKey: string, verified: boolean) {
    if (!this.documents[documentKey]) {
      throw new DomainError(`Document "${documentKey}" not found`);
    }

    this.documents[documentKey].marked = verified;
    this.updatedAt = new Date();
  }
}
