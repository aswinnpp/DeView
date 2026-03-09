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
  status: 'SCHEDULED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED';
  interviewerAccepted?: boolean;
  interviewerRejectReason?: string;
  /** Candidate requested to reschedule (date + reason). */
  candidateRejection?: { date: string; reason: string };
  /** Status of candidate reschedule request (pending/declined). */
  candidateRejectionStatus?: 'PENDING' | 'DECLINED';
  createdAt: Date;
  updatedAt: Date;
}

