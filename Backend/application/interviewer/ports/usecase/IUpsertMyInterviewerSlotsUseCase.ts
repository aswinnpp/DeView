import type { IInterviewerSlotsDocument } from "../../../../infrastructure/persistence/mongodb/schemas/InterviewerSlotsDocument.js";

export interface IUpsertMyInterviewerSlotsUseCase {
  execute(input: {
    interviewerId: string;
    companyId: string;
    slotDate: string; 
    times: string[]; 
    booked?: boolean;
  }): Promise<IInterviewerSlotsDocument>;
}

