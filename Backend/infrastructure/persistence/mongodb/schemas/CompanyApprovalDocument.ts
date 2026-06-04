import { ObjectId } from 'mongodb';

export type CompanySubscriptionStatus = 'Active' | 'Pending' | 'Expired';

export interface ICompanySubscriptionRecord {
  id: string;
  planId: string;
  planName: string;
  price: number;
  duration: 'Monthly' | 'Quarterly' | 'Annual';
  startAt: Date;
  endsAt: Date;
  status: CompanySubscriptionStatus;
  createdAt: Date;
  sourcePaymentIntentId?: string;
  /** Embedded limits at purchase time. Optional for legacy records. */
  interviewLimit?: number;
  interviewUnlimited?: boolean;
  jobPostLimit?: number;
  jobUnlimited?: boolean;
}

export interface ICompanyApprovalDocument {
  _id?: ObjectId;
  userId: string;
  companyName: string;
  logoUrl?: string;
  location?: string;
  address: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  taxId: string;
  website?: string;
  numberOfEmployees: string;
  documents: ICompanyDocuments;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  isActive: boolean;
  // New subscription management fields (embedded in company profile)
  activeSubscription?: ICompanySubscriptionRecord | null;
  pendingSubscriptions?: ICompanySubscriptionRecord[];
  subscriptionHistory?: ICompanySubscriptionRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICompanyDocuments {
  certificateOfIncorporation?: IDocumentUpload;
  gstCertificate?: IDocumentUpload;
  panCard?: IDocumentUpload;
  addressProof?: IDocumentUpload;
  authorizedSignatoryId?: IDocumentUpload;
  bankDocument?: IDocumentUpload;
}

export interface IDocumentUpload {
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
  marked: boolean;
}
