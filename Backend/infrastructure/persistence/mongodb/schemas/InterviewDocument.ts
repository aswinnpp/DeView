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
  interviewType: 'ONLINE' | 'CALL' | 'F2F';
  interviewLocation?: string;
  status: 'SCHEDULED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED';
  feedbackSubmitted?: boolean;
  interviewerAccepted?: boolean;
  interviewerRejectReason?: string;
  candidateRejection?: { date: string; reason: string };
  candidateRejectionStatus?: 'PENDING' | 'DECLINED';
  createdAt: Date;
  updatedAt: Date;
}

