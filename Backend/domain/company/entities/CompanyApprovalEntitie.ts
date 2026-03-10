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

export type CompanySubscriptionStatus = "Active" | "Pending" | "Expired";

/** Embedded plan limits at subscription time. Admin plan edits do not affect existing subscribers. */
export interface CompanySubscriptionRecord {
  id: string;
  planId: string;
  planName: string;
  price: number;
  duration: "Monthly" | "Quarterly" | "Annual";
  startAt: Date;
  endsAt: Date;
  status: CompanySubscriptionStatus;
  createdAt: Date;
  sourcePaymentIntentId?: string;
  /** Embedded limits at purchase time (not from plan table). Optional for legacy records. */
  interviewLimit?: number;
  interviewUnlimited?: boolean;
  jobPostLimit?: number;
  jobUnlimited?: boolean;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function calculateEndDate(startAt: Date, duration: "Monthly" | "Quarterly" | "Annual"): Date {
  switch (duration) {
    case "Monthly":
      return addMonths(startAt, 1);
    case "Quarterly":
      return addMonths(startAt, 3);
    case "Annual":
      return addMonths(startAt, 12);
    default:
      return addMonths(startAt, 1);
  }
}

export class CompanyApproval {
  constructor(
    public id: string | null,
    public userId: string,
    public companyName: string,
    public location: string | undefined,
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
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public activeSubscription: CompanySubscriptionRecord | null = null,
    public pendingSubscriptions: CompanySubscriptionRecord[] = [],
    public subscriptionHistory: CompanySubscriptionRecord[] = []
  ) {}

  private ensureSubscriptionArraysInitialized(): void {
    if (!this.pendingSubscriptions) this.pendingSubscriptions = [];
    if (!this.subscriptionHistory) this.subscriptionHistory = [];
  }

  /**
   * Refresh subscription state based on current time:
   * - Move expired active subscriptions to history
   * - Promote pending subscriptions when appropriate
   */
  refreshSubscriptions(now: Date): void {
    this.ensureSubscriptionArraysInitialized();

    while (this.activeSubscription && this.activeSubscription.endsAt <= now) {
      const expired = {
        ...this.activeSubscription,
        status: "Expired" as const,
      };
      this.subscriptionHistory.push(expired);
      this.activeSubscription = null;

      if (!this.pendingSubscriptions.length) {
        break;
      }

      const next = this.pendingSubscriptions.shift()!;
      const startAt = next.startAt <= now ? next.startAt : now;
      const endsAt = calculateEndDate(startAt, next.duration);
      this.activeSubscription = {
        ...next,
        startAt,
        endsAt,
        status: "Active",
      };
    }
  }

  /**
   * Enqueue a newly purchased subscription, activating immediately if there is no active plan.
   * Embeds plan limits so admin edits to the plan do not affect existing subscribers.
   */
  addPurchasedPlanAsActiveOrPending(
    input: {
      planId: string;
      planName: string;
      price: number;
      duration: "Monthly" | "Quarterly" | "Annual";
      sourcePaymentIntentId?: string;
      interviewLimit?: number;
      interviewUnlimited?: boolean;
      jobPostLimit?: number;
      jobUnlimited?: boolean;
    },
    now: Date
  ): void {
    this.ensureSubscriptionArraysInitialized();
    this.refreshSubscriptions(now);

    const lastEnd =
      this.activeSubscription?.endsAt ??
      this.pendingSubscriptions[this.pendingSubscriptions.length - 1]?.endsAt ??
      now;

    const isFirst = !this.activeSubscription && this.pendingSubscriptions.length === 0;
    const startAt = isFirst ? now : lastEnd;
    const endsAt = calculateEndDate(startAt, input.duration);

    const record: CompanySubscriptionRecord = {
      id: crypto.randomUUID(),
      planId: input.planId,
      planName: input.planName,
      price: input.price,
      duration: input.duration,
      startAt,
      endsAt,
      status: isFirst ? "Active" : "Pending",
      createdAt: now,
      sourcePaymentIntentId: input.sourcePaymentIntentId,
      interviewLimit: input.interviewLimit,
      interviewUnlimited: input.interviewUnlimited,
      jobPostLimit: input.jobPostLimit,
      jobUnlimited: input.jobUnlimited,
    };

    if (isFirst) {
      this.activeSubscription = record;
    } else {
      this.pendingSubscriptions.push(record);
    }
  }

  /**
   * Manually activate a pending subscription immediately.
   */
  activatePendingNow(pendingId: string, now: Date): void {
    this.ensureSubscriptionArraysInitialized();
    this.refreshSubscriptions(now);

    const index = this.pendingSubscriptions.findIndex((p) => p.id === pendingId);
    if (index === -1) {
      throw new DomainError("Pending subscription not found");
    }

    const selected = this.pendingSubscriptions.splice(index, 1)[0];

    if (this.activeSubscription) {
      const expired = {
        ...this.activeSubscription,
        status: "Expired" as const,
        endsAt: now,
      };
      this.subscriptionHistory.push(expired);
    }

    const endsAt = calculateEndDate(now, selected.duration);
    this.activeSubscription = {
      ...selected,
      startAt: now,
      endsAt,
      status: "Active",
    };

    let cursor = this.activeSubscription.endsAt;
    this.pendingSubscriptions = this.pendingSubscriptions.map((p) => {
      const startAt = cursor;
      const nextEndsAt = calculateEndDate(startAt, p.duration);
      cursor = nextEndsAt;
      return {
        ...p,
        startAt,
        endsAt: nextEndsAt,
        status: "Pending" as const,
      };
    });
  }

  approve() {
    if (this.status == "approved") {
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

  updateFields(
    fields: Partial<
      Omit<
        CompanyApproval,
        "id" | "userId" | "documents" | "status" | "rejectionReason" | "isActive" | "createdAt" | "updatedAt"
      >
    >
  ) {
    if (fields.companyName !== undefined) {
      this.companyName = fields.companyName;
    }
    if (fields.location !== undefined) {
      this.location = fields.location;
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
