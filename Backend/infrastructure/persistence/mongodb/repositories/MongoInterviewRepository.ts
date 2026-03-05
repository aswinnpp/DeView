import type { Collection, Filter } from 'mongodb';
import { ObjectId } from 'mongodb';
import { BaseMongoRepository } from './BaseMongoRepository.js';
import { Interview } from '../../../../domain/interview/entities/Interview.js';
import type { IInterviewRepository } from '../../../../application/interview/ports/repository/IInterviewRepository.js';
import type { IInterviewDocument } from '../schemas/InterviewDocument.js';

export class MongoInterviewRepository
  extends BaseMongoRepository<Interview, IInterviewDocument>
  implements IInterviewRepository
{
  constructor(collection: Collection<IInterviewDocument>) {
    super(collection);
  }

  async create(interview: Interview): Promise<Interview> {
    const doc = this.toDocument(interview);
    const res = await this.collection.insertOne(doc);
    return this.toDomain({ ...doc, _id: res.insertedId });
  }

  async listByCandidateUserId(candidateUserId: string): Promise<Interview[]> {
    const filter: Filter<IInterviewDocument> = { candidateUserId };
    const docs = await this.collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map((d) => this.toDomain(d));
  }

  async listByCompanyId(companyId: string): Promise<Interview[]> {
    const filter: Filter<IInterviewDocument> = { companyId };
    const docs = await this.collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map((d) => this.toDomain(d));
  }

  async findById(id: string): Promise<Interview | null> {
    let _id: ObjectId;
    try {
      _id = new ObjectId(id);
    } catch {
      return null;
    }

    const doc = await this.collection.findOne({ _id });
    return doc ? this.toDomain(doc) : null;
  }

  protected toDomain(doc: IInterviewDocument): Interview {
    return new Interview(
      doc._id?.toString() ?? null,
      doc.companyId,
      doc.companyName,
      doc.jobId,
      doc.jobTitle,
      doc.roomName,
      doc.applicationId,
      doc.candidateUserId,
      doc.candidateName,
      doc.interviewerUserId,
      doc.interviewerName,
      doc.round,
      doc.scheduledDate,
      doc.scheduledTime,
      doc.status,
      doc.createdAt,
      doc.updatedAt
    );
  }

  protected toDocument(entity: Interview): IInterviewDocument {
    return {
      ...(entity.id && { _id: new ObjectId(entity.id) }),
      companyId: entity.companyId,
      companyName: entity.companyName,
      jobId: entity.jobId,
      jobTitle: entity.jobTitle,
      roomName: entity.roomName,
      applicationId: entity.applicationId,
      candidateUserId: entity.candidateUserId,
      candidateName: entity.candidateName,
      interviewerUserId: entity.interviewerUserId,
      interviewerName: entity.interviewerName,
      round: entity.round,
      scheduledDate: entity.scheduledDate,
      scheduledTime: entity.scheduledTime,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

