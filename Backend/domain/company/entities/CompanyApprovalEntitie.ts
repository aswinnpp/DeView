import { CompanyStatus } from "../value-objects/CompanyStatus";
import { DomainError } from "../../../shared/errors/DomainError";

export interface CompanyDocumentUpload {
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
  marked: boolean;
}

export interface CompanyDocuments {
  certificateOfIncorporation?: CompanyDocumentUpload;
  gstCertificate?: CompanyDocumentUpload;
  panCard?: CompanyDocumentUpload;
  addressProof?: CompanyDocumentUpload;
  authorizedSignatoryId?: CompanyDocumentUpload;
  bankDocument?: CompanyDocumentUpload;
}

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
    public documents: CompanyDocuments,
    public website?: string,
    public status: CompanyStatus = "pending",
    public rejectionReason?: string,
    public isActive: boolean = true,
    public subscriptionPlanId?: string,
    public subscriptionEndsAt?: Date,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) { }

  setSubscription(planId: string, endsAt: Date): void {
    this.subscriptionPlanId = planId;
    this.subscriptionEndsAt = endsAt;
    this.updatedAt = new Date();
  }

  approve() {
    if (this.status == "approved" ) {
      throw new DomainError("already approved");
    }

    this.status = "approved";
    this.isActive = true;
    this.updatedAt = new Date();
  }

  reject(reason: string) {
   

    if (!reason.trim()) {
      throw new DomainError("Rejection reason required");
    }

    this.status = "rejected";
    this.rejectionReason = reason;
    this.updatedAt = new Date();
  }

  deactivate() {
    if (this.status !== "approved") {
      throw new DomainError("Only approved companies can be deactivated");
    }

    if (!this.isActive) {
      throw new DomainError("Company is already deactivated");
    }

    this.isActive = false;
    this.updatedAt = new Date();
  }

  activate() {
    if (this.status !== "approved") {
      throw new DomainError("Only approved companies can be activated");
    }

    if (this.isActive) {
      throw new DomainError("Company is already active");
    }

    this.isActive = true;
    this.updatedAt = new Date();
  }

  markDocument(documentKey: keyof CompanyDocuments, verified: boolean) {
    if (!this.documents[documentKey]) {
      throw new DomainError(`Document "${documentKey}" not found`);
    }

    this.documents[documentKey].marked = verified;
    this.updatedAt = new Date();
  }

  updateFields(fields: Partial<Omit<CompanyApproval, "id" | "userId" | "documents" | "status" | "rejectionReason" | "isActive" | "createdAt" | "updatedAt">>) {
    if (fields.companyName !== undefined) {
      this.companyName = fields.companyName;
    }
    if (fields.address !== undefined) {
      this.address = fields.address;
    }
    if (fields.contactPerson !== undefined) {
      this.contactPerson = fields.contactPerson;
    }
    if (fields.contactEmail !== undefined) {
      this.contactEmail = fields.contactEmail;
    }
    if (fields.contactPhone !== undefined) {
      this.contactPhone = fields.contactPhone;
    }
    if (fields.taxId !== undefined) {
      this.taxId = fields.taxId;
    }
    if (fields.website !== undefined) {
      this.website = fields.website;
    }
    if (fields.numberOfEmployees !== undefined) {
      this.numberOfEmployees = fields.numberOfEmployees;
    }

    this.updatedAt = new Date();
  }
}
