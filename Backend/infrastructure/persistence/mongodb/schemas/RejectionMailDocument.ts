import { ObjectId } from 'mongodb';

export interface IRejectionMailDocument {
  _id?: ObjectId;
  applicationId: string;
  jobId: string;
  companyId: string;
  candidateUserId: string;
  candidateName: string;
  candidateEmail: string;
  content: string;
  createdAt: Date;
}

