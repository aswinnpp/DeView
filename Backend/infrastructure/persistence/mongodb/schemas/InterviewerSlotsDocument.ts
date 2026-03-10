import { ObjectId } from "mongodb";

export interface IInterviewerSlotsDocument {
  _id?: ObjectId;
  interviewerId: string;
  companyId?: string;
  slotDate: string; // YYYY-MM-DD
  times: string[]; // ISO datetime strings
  booked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

