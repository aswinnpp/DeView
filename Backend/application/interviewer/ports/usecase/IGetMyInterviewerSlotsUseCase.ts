import type { IInterviewerSlotsDocument } from "../../../../infrastructure/persistence/mongodb/schemas/InterviewerSlotsDocument.js";

export interface IGetMyInterviewerSlotsUseCase {
  execute(input: {
    interviewerId: string;
    companyId: string;
    slotDate?: string;
  }): Promise<IInterviewerSlotsDocument[]>;
}

