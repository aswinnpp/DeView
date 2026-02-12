
import { CompanyStatus } from "../value-objects/CompanyStatus";

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
    public rejectionReason?: string
  
   
  ) {}

  approve() {
    if (this.status !== "pending") {
      throw new Error("Only pending companies can be approved");
    }

    this.status = "approved";
  }

  reject(reason: string) {
    if (this.status !== "pending") {
      throw new Error("Only pending companies can be rejected");
    }

    if (!reason.trim()) {
      throw new Error("Rejection reason required");
    }

    this.status = "rejected";
    this.rejectionReason = reason;
  }
}
