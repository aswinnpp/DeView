import type { Collection, InsertOneResult } from 'mongodb';
import { ObjectId } from 'mongodb';
import { RejectionMail } from '../../../../domain/application/entities/RejectionMail.js';
import type { IRejectionMailRepository } from '../../../../application/application/ports/repository/IRejectionMailRepository.js';
import type { IRejectionMailDocument } from '../schemas/RejectionMailDocument.js';

function toDomain(doc: IRejectionMailDocument): RejectionMail {
  return new RejectionMail(
    doc._id?.toString() ?? null,
    doc.applicationId,
    doc.jobId,
    doc.companyId,
    doc.candidateUserId,
    doc.candidateName,
    doc.candidateEmail,
    doc.content,
    doc.createdAt
  );
}

export class MongoRejectionMailRepository implements IRejectionMailRepository {
  constructor(private readonly collection: Collection<IRejectionMailDocument>) {}

  async create(input: {
    applicationId: string;
    jobId: string;
    companyId: string;
    candidateUserId: string;
    candidateName: string;
    candidateEmail: string;
    content: string;
  }): Promise<RejectionMail> {
    const doc: IRejectionMailDocument = {
      applicationId: input.applicationId,
      jobId: input.jobId,
      companyId: input.companyId,
      candidateUserId: input.candidateUserId,
      candidateName: input.candidateName,
      candidateEmail: input.candidateEmail,
      content: input.content,
      createdAt: new Date(),
    };

    const result: InsertOneResult<IRejectionMailDocument> = await this.collection.insertOne(doc);
    const inserted: IRejectionMailDocument = {
      ...doc,
      _id: result.insertedId ?? new ObjectId(),
    };
    return toDomain(inserted);
  }
}

