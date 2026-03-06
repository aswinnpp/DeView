import { ObjectId } from 'mongodb';

export interface IInterviewDocument {
  _id?: ObjectId;
  companyId: string;
  companyName: string;
  jobId: string;
  jobTitle: string;
  roomName: string;
  applicationId: string;
  candidateUserId: string;
  candidateName: string;
  interviewerUserId: string;
  interviewerName: string;
  round: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  interviewerAccepted?: boolean;
  interviewerRejectReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

