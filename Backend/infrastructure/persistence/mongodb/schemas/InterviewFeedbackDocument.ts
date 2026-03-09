import { ObjectId } from 'mongodb';

export interface IInterviewFeedbackDocument {
  _id?: ObjectId;
  interviewId: string;
  candidateUserId: string;
  companyId: string;
  companyName: string;
  interviewerUserId: string;
  interviewerName: string;
  feedback: string;
  totalScore: number;
  createdAt: Date;
  updatedAt: Date;
}

