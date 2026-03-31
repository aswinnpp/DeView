import type { Collection, InsertOneResult } from 'mongodb';
import { ObjectId } from 'mongodb';
import type { OfferMailStatus } from '../../../../domain/entities/OfferMail.js';
import { OfferMail } from '../../../../domain/entities/OfferMail.js';
import type { IOfferMailRepository } from '../../../../application/job-application/ports/repository/IOfferMailRepository.js';
import type { IOfferMailDocument } from '../schemas/OfferMailDocument.js';

function normalizeStatus(raw: OfferMailStatus | undefined): OfferMailStatus {
  if (raw === 'accepted' || raw === 'declined' || raw === 'counter') return raw;
  return 'pending';
}

function toDomain(doc: IOfferMailDocument): OfferMail {
  return new OfferMail(
    doc._id?.toString() ?? null,
    doc.applicationId,
    doc.jobId,
    doc.companyId,
    doc.candidateUserId,
    doc.candidateName,
    doc.candidateEmail,
    doc.content,
    doc.salary,
    doc.location,
    doc.startDate,
    doc.benefits,
    doc.positionTitle,
    normalizeStatus(doc.status),
    doc.createdAt,
    doc.docusignAcceptanceEnvelopeId
  );
}

export class MongoOfferMailRepository implements IOfferMailRepository {
  constructor(private readonly _collection: Collection<IOfferMailDocument>) {}

  async create(input: {
    applicationId: string;
    jobId: string;
    companyId: string;
    candidateUserId: string;
    candidateName: string;
    candidateEmail: string;
    content: string;
    salary?: string;
    location?: string;
    startDate?: string;
    benefits?: string;
    positionTitle?: string;
  }): Promise<OfferMail> {
    const doc: IOfferMailDocument = {
      applicationId: input.applicationId,
      jobId: input.jobId,
      companyId: input.companyId,
      candidateUserId: input.candidateUserId,
      candidateName: input.candidateName,
      candidateEmail: input.candidateEmail,
      content: input.content,
      ...(input.salary !== undefined && { salary: input.salary }),
      ...(input.location !== undefined && { location: input.location }),
      ...(input.startDate !== undefined && { startDate: input.startDate }),
      ...(input.benefits !== undefined && { benefits: input.benefits }),
      ...(input.positionTitle !== undefined && { positionTitle: input.positionTitle }),
      status: 'pending',
      createdAt: new Date(),
    };

    const result: InsertOneResult<IOfferMailDocument> = await this._collection.insertOne(doc);
    const inserted: IOfferMailDocument = {
      ...doc,
      _id: result.insertedId ?? new ObjectId(),
    };
    return toDomain(inserted);
  }

  async listByCompanyId(companyId: string): Promise<OfferMail[]> {
    const docs = await this._collection
      .find({ companyId })
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map((d) => toDomain(d));
  }

  async listByCandidateUserId(candidateUserId: string): Promise<OfferMail[]> {
    const docs = await this._collection
      .find({ candidateUserId })
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map((d) => toDomain(d));
  }

  async findByIdAndCandidateUserId(
    offerMailId: string,
    candidateUserId: string
  ): Promise<OfferMail | null> {
    let oid: ObjectId;
    try {
      oid = new ObjectId(offerMailId);
    } catch {
      return null;
    }
    const doc = await this._collection.findOne({ _id: oid, candidateUserId });
    return doc ? toDomain(doc) : null;
  }

  async findByIdAndCompanyId(offerMailId: string, companyId: string): Promise<OfferMail | null> {
    let oid: ObjectId;
    try {
      oid = new ObjectId(offerMailId);
    } catch {
      return null;
    }
    const doc = await this._collection.findOne({ _id: oid, companyId });
    return doc ? toDomain(doc) : null;
  }

  async markStatusCounterIfEligible(
    offerMailId: string,
    candidateUserId: string
  ): Promise<OfferMail | null> {
    let oid: ObjectId;
    try {
      oid = new ObjectId(offerMailId);
    } catch {
      return null;
    }

    const result = await this._collection.findOneAndUpdate(
      {
        _id: oid,
        candidateUserId,
        $or: [{ status: { $exists: false } }, { status: 'pending' }, { status: 'counter' }],
      },
      { $set: { status: 'counter' } },
      { returnDocument: 'after' }
    );
    return result ? toDomain(result) : null;
  }

  async updateStatus(
    offerMailId: string,
    status: 'accepted' | 'declined'
  ): Promise<OfferMail | null> {
    let oid: ObjectId;
    try {
      oid = new ObjectId(offerMailId);
    } catch {
      return null;
    }
    const result = await this._collection.findOneAndUpdate(
      { _id: oid },
      { $set: { status } },
      { returnDocument: 'after' }
    );
    return result ? toDomain(result) : null;
  }

  async applyCounterTerms(
    offerMailId: string,
    terms: {
      salary?: string;
      location?: string;
      startDate?: string;
      benefits?: string;
      positionTitle?: string;
    }
  ): Promise<OfferMail | null> {
    let oid: ObjectId;
    try {
      oid = new ObjectId(offerMailId);
    } catch {
      return null;
    }

    const $set: Partial<Record<keyof IOfferMailDocument, unknown>> = {};
    if (terms.salary !== undefined) $set.salary = terms.salary;
    if (terms.location !== undefined) $set.location = terms.location;
    if (terms.startDate !== undefined) $set.startDate = terms.startDate;
    if (terms.benefits !== undefined) $set.benefits = terms.benefits;
    if (terms.positionTitle !== undefined) $set.positionTitle = terms.positionTitle;

    if (Object.keys($set).length === 0) {
      // Nothing to update; caller will still transition status as needed.
      const doc = await this._collection.findOne({ _id: oid });
      return doc ? toDomain(doc) : null;
    }

    const result = await this._collection.findOneAndUpdate(
      { _id: oid },
      { $set },
      { returnDocument: 'after' }
    );

    return result ? toDomain(result) : null;
  }

  async setStatusPending(offerMailId: string): Promise<OfferMail | null> {
    let oid: ObjectId;
    try {
      oid = new ObjectId(offerMailId);
    } catch {
      return null;
    }

    const result = await this._collection.findOneAndUpdate(
      { _id: oid },
      {
        $set: { status: 'pending' },
        // If the offer was previously used for signing attempts, ensure we re-create a fresh session.
        $unset: { docusignAcceptanceEnvelopeId: '' },
      },
      { returnDocument: 'after' }
    );

    return result ? toDomain(result) : null;
  }

  async updateStatusIfCandidatePending(
    offerMailId: string,
    candidateUserId: string,
    status: 'accepted' | 'declined'
  ): Promise<OfferMail | null> {
    let oid: ObjectId;
    try {
      oid = new ObjectId(offerMailId);
    } catch {
      return null;
    }
    const result = await this._collection.findOneAndUpdate(
      {
        _id: oid,
        candidateUserId,
        $or: [{ status: 'pending' }, { status: { $exists: false } }],
      },
      { $set: { status } },
      { returnDocument: 'after' }
    );
    return result ? toDomain(result) : null;
  }

  async setAcceptanceEnvelopeId(
    offerMailId: string,
    candidateUserId: string,
    envelopeId: string
  ): Promise<OfferMail | null> {
    let oid: ObjectId;
    try {
      oid = new ObjectId(offerMailId);
    } catch {
      return null;
    }
    const result = await this._collection.findOneAndUpdate(
      {
        _id: oid,
        candidateUserId,
        $or: [{ status: 'pending' }, { status: { $exists: false } }],
      },
      { $set: { docusignAcceptanceEnvelopeId: envelopeId } },
      { returnDocument: 'after' }
    );
    return result ? toDomain(result) : null;
  }

  async clearAcceptanceEnvelopeId(
    offerMailId: string,
    candidateUserId: string
  ): Promise<OfferMail | null> {
    let oid: ObjectId;
    try {
      oid = new ObjectId(offerMailId);
    } catch {
      return null;
    }
    const result = await this._collection.findOneAndUpdate(
      {
        _id: oid,
        candidateUserId,
        $or: [{ status: 'pending' }, { status: { $exists: false } }],
      },
      { $unset: { docusignAcceptanceEnvelopeId: '' } },
      { returnDocument: 'after' }
    );
    return result ? toDomain(result) : null;
  }

  async markAcceptedAfterSigning(
    offerMailId: string,
    candidateUserId: string,
    envelopeId: string
  ): Promise<OfferMail | null> {
    let oid: ObjectId;
    try {
      oid = new ObjectId(offerMailId);
    } catch {
      return null;
    }
    const result = await this._collection.findOneAndUpdate(
      {
        _id: oid,
        candidateUserId,
        docusignAcceptanceEnvelopeId: envelopeId,
        $or: [{ status: 'pending' }, { status: { $exists: false } }],
      },
      { $set: { status: 'accepted' } },
      { returnDocument: 'after' }
    );
    return result ? toDomain(result) : null;
  }

  async findLegacyEmbeddedCountersByOfferMailIds(
    offerMailIds: string[]
  ): Promise<Map<string, { content: string; sentAt: Date }>> {
    const map = new Map<string, { content: string; sentAt: Date }>();
    const oids: ObjectId[] = [];
    for (const id of offerMailIds) {
      try {
        oids.push(new ObjectId(String(id).trim()));
      } catch {
        /* skip */
      }
    }
    if (oids.length === 0) return map;

    const docs = await this._collection
      .find({
        _id: { $in: oids },
        counterLetter: { $exists: true, $nin: [''] },
      })
      .project({ counterLetter: 1, counterSentAt: 1 })
      .toArray();

    for (const doc of docs) {
      const id = doc._id?.toString();
      const letter = doc.counterLetter?.trim();
      if (!id || !letter) continue;
      map.set(id, {
        content: letter,
        sentAt: doc.counterSentAt instanceof Date ? doc.counterSentAt : new Date(0),
      });
    }
    return map;
  }
}
