import { ObjectId } from 'mongodb';

export interface IInterviewFeedbackDocument {
  _id?: ObjectId;
  interviewId: string;
  candidateUserId: string;
  companyId: string;
  companyName: string;
  jobId?: string;
  interviewerUserId: string;
  interviewerName: string;
  round?: string;
  interviewType?: 'ONLINE' | 'CALL' | 'F2F';
  interviewLocation?: string;
  feedback: string;
  totalScore: number;
  createdAt: Date;
  updatedAt: Date;
}

