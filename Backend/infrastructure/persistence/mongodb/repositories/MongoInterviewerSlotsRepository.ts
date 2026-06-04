import type { Collection } from "mongodb";
import type { IInterviewerSlotsRepository } from "../../../../application/interviewer/ports/repository/IInterviewerSlotsRepository";
import type { IInterviewerSlotsDocument } from "../schemas/InterviewerSlotsDocument.js";

export class MongoInterviewerSlotsRepository implements IInterviewerSlotsRepository {
  constructor(private readonly _collection: Collection<IInterviewerSlotsDocument>) {}

  async listByInterviewer(input: {
    interviewerId: string;
    companyId: string;
    slotDate?: string;
  }): Promise<IInterviewerSlotsDocument[]> {
    const filter: Partial<IInterviewerSlotsDocument> & { interviewerId: string; companyId: string } = {
      interviewerId: input.interviewerId,
      companyId: input.companyId,
    };
    if (input.slotDate) filter.slotDate = input.slotDate;

    return this._collection.find(filter).sort({ slotDate: 1, updatedAt: -1 }).toArray();
  }

  async upsertForInterviewerDate(input: {
    interviewerId: string;
    companyId: string;
    slotDate: string;
    times: string[];
    booked: boolean;
  }): Promise<IInterviewerSlotsDocument> {
    const now = new Date();

    await this._collection.updateOne(
      { interviewerId: input.interviewerId, companyId: input.companyId, slotDate: input.slotDate },
      {
        $set: {
          interviewerId: input.interviewerId,
          companyId: input.companyId,
          slotDate: input.slotDate,
          times: input.times,
          booked: input.booked,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true },
    );

    const doc = await this._collection.findOne({
      interviewerId: input.interviewerId,
      companyId: input.companyId,
      slotDate: input.slotDate,
    });

    // Should exist after upsert; fallback is a safe default
    return (
      doc ?? {
        interviewerId: input.interviewerId,
        companyId: input.companyId,
        slotDate: input.slotDate,
        times: input.times,
        booked: input.booked,
        createdAt: now,
        updatedAt: now,
      }
    );
  }
}

