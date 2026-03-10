import type { IInterviewerSlotsDocument } from "../../../../infrastructure/persistence/mongodb/schemas/InterviewerSlotsDocument.js";

export interface IUpsertMyInterviewerSlotsUseCase {
  execute(input: {
    interviewerId: string;
    companyId: string;
    slotDate: string; // YYYY-MM-DD
    times: string[]; // ISO datetime strings
    booked?: boolean;
  }): Promise<IInterviewerSlotsDocument>;
}

