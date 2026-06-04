import type { IInterviewerSlotsDocument } from "../../../../infrastructure/persistence/mongodb/schemas/InterviewerSlotsDocument.js";

export interface IInterviewerSlotsRepository {
  listByInterviewer(input: {
    interviewerId: string;
    companyId: string;
    slotDate?: string;
  }): Promise<IInterviewerSlotsDocument[]>;

  upsertForInterviewerDate(input: {
    interviewerId: string;
    companyId: string;
    slotDate: string;
    times: string[];
    booked: boolean;
  }): Promise<IInterviewerSlotsDocument>;
}

