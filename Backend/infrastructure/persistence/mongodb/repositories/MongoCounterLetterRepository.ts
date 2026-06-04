import type { Collection, InsertOneResult } from 'mongodb';
import { ObjectId } from 'mongodb';
import type { CounterResponseStatus } from '../../../../domain/entities/CounterLetter.js';
import { CounterLetter } from '../../../../domain/entities/CounterLetter.js';
import type { ICounterLetterRepository } from '../../../../application/job-application/ports/repository/ICounterLetterRepository.js';
import type { ICounterLetterDocument } from '../schemas/CounterLetterDocument.js';

function toDomain(doc: ICounterLetterDocument): CounterLetter {
  const rs = doc.responseStatus;
  const responseStatus: CounterResponseStatus =
    rs === 'accepted' || rs === 'rejected' ? rs : 'pending';
  return new CounterLetter(
    doc._id?.toString() ?? null,
    doc.offerMailId,
    doc.applicationId,
    doc.jobId,
    doc.companyId,
    doc.candidateUserId,
    doc.content,
    doc.salary,
    doc.location,
    doc.startDate,
    doc.benefits,
    doc.positionTitle,
    doc.createdAt,
    responseStatus
  );
}

export class MongoCounterLetterRepository implements ICounterLetterRepository {
  constructor(private readonly _collection: Collection<ICounterLetterDocument>) {}

  async create(input: {
    offerMailId: string;
    applicationId: string;
    jobId: string;
    companyId: string;
    candidateUserId: string;
    content: string;
    salary?: string;
    location?: string;
    startDate?: string;
    benefits?: string;
    positionTitle?: string;
  }): Promise<CounterLetter> {
    const normalizeOptionalText = (v: string | undefined): string | undefined => {
      const t = (v ?? '').trim();
      return t.length > 0 ? t : undefined;
    };

    const doc: ICounterLetterDocument = {
      offerMailId: input.offerMailId,
      applicationId: input.applicationId,
      jobId: input.jobId,
      companyId: input.companyId,
      candidateUserId: input.candidateUserId,
      content: input.content.trim(),
      ...(input.salary !== undefined && { salary: normalizeOptionalText(input.salary) }),
      ...(input.location !== undefined && { location: normalizeOptionalText(input.location) }),
      ...(input.startDate !== undefined && { startDate: normalizeOptionalText(input.startDate) }),
      ...(input.benefits !== undefined && { benefits: normalizeOptionalText(input.benefits) }),
      ...(input.positionTitle !== undefined && { positionTitle: normalizeOptionalText(input.positionTitle) }),
      createdAt: new Date(),
    };

    const result: InsertOneResult<ICounterLetterDocument> = await this._collection.insertOne(doc);
    const inserted: ICounterLetterDocument = {
      ...doc,
      _id: result.insertedId ?? new ObjectId(),
    };
    return toDomain(inserted);
  }

  async findLatestByOfferMailIds(offerMailIds: string[]): Promise<Map<string, CounterLetter>> {
    const map = new Map<string, CounterLetter>();
    const ids = [...new Set(offerMailIds.map((id) => String(id ?? '').trim()).filter(Boolean))];
    if (ids.length === 0) return map;

    const docs = await this._collection
      .find({ offerMailId: { $in: ids } })
      .sort({ createdAt: -1 })
      .toArray();

    for (const doc of docs) {
      const key = doc.offerMailId;
      if (!map.has(key)) {
        map.set(key, toDomain(doc));
      }
    }
    return map;
  }

  async updateResponseStatusByOfferMailId(
    offerMailId: string,
    responseStatus: 'accepted' | 'rejected'
  ): Promise<CounterLetter | null> {
    const id = String(offerMailId ?? '').trim();
    if (!id) return null;

    const doc = await this._collection.findOneAndUpdate(
      { offerMailId: id },
      { $set: { responseStatus } },
      { sort: { createdAt: -1 }, returnDocument: 'after' }
    );
    return doc ? toDomain(doc) : null;
  }
}
