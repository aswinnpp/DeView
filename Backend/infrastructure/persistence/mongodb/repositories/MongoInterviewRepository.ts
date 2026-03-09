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
    const filter: Filter<IInterviewDocument> = {
      candidateUserId,
      interviewerAccepted: true,
      status: { $in: ['SCHEDULED', 'RESCHEDULED'] },
    };
    const docs = await this.collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map((d) => this.toDomain(d));
  }

  async listByInterviewerUserId(interviewerUserId: string): Promise<Interview[]> {
    const filter: Filter<IInterviewDocument> = {
      interviewerUserId,
      status: { $in: ['SCHEDULED', 'RESCHEDULED'] },
    };
    const docs = await this.collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map((d) => this.toDomain(d));
  }

  async setInterviewerAccepted(id: string, accepted: boolean, rejectReason?: string): Promise<Interview | null> {
    let _id: ObjectId;
    try {
      _id = new ObjectId(id);
    } catch {
      return null;
    }
    const update: Partial<IInterviewDocument> = {
      interviewerAccepted: accepted,
      interviewerRejectReason: rejectReason,
      updatedAt: new Date(),
    };
    const result = await this.collection.findOneAndUpdate(
      { _id },
      { $set: update },
      { returnDocument: 'after' }
    );
    return result ? this.toDomain(result) : null;
  }

  async setCandidateRejection(id: string, input: { date: string; reason: string }): Promise<Interview | null> {
    let _id: ObjectId;
    try {
      _id = new ObjectId(id);
    } catch {
      return null;
    }
    const update: Partial<IInterviewDocument> = {
      status: 'RESCHEDULED',
      candidateRejection: { date: input.date.trim(), reason: input.reason.trim() },
      candidateRejectionStatus: 'PENDING',
      updatedAt: new Date(),
    };
    const result = await this.collection.findOneAndUpdate(
      { _id },
      { $set: update },
      { returnDocument: 'after' }
    );
    return result ? this.toDomain(result) : null;
  }

  async findActiveByApplicationId(applicationId: string): Promise<Interview | null> {
    const doc = await this.collection
      .find({ applicationId, status: { $in: ['SCHEDULED', 'RESCHEDULED'] } })
      .sort({ createdAt: -1 })
      .limit(1)
      .next();
    return doc ? this.toDomain(doc) : null;
  }

  async declineCandidateRejection(id: string): Promise<Interview | null> {
    let _id: ObjectId;
    try {
      _id = new ObjectId(id);
    } catch {
      return null;
    }
    const update: Partial<IInterviewDocument> = {
      status: 'SCHEDULED',
      candidateRejectionStatus: 'DECLINED',
      updatedAt: new Date(),
    };
    const result = await this.collection.findOneAndUpdate(
      { _id },
      { $set: update },
      { returnDocument: 'after' }
    );
    return result ? this.toDomain(result) : null;
  }

  async rescheduleFromCompany(
    id: string,
    input: { scheduledDate: string; scheduledTime: string; interviewerUserId: string; interviewerName: string; round: string }
  ): Promise<Interview | null> {
    let _id: ObjectId;
    try {
      _id = new ObjectId(id);
    } catch {
      return null;
    }
    const update: Partial<IInterviewDocument> = {
      scheduledDate: input.scheduledDate.trim(),
      scheduledTime: input.scheduledTime.trim(),
      interviewerUserId: input.interviewerUserId.trim(),
      interviewerName: input.interviewerName.trim(),
      round: input.round.trim(),
      status: 'SCHEDULED',
      updatedAt: new Date(),
    };
    const result = await this.collection.findOneAndUpdate(
      { _id },
      { $set: update, $unset: { candidateRejection: '', candidateRejectionStatus: '', interviewerRejectReason: '' } },
      { returnDocument: 'after' }
    );
    return result ? this.toDomain(result) : null;
  }

  async updateStatus(id: string, status: IInterviewDocument['status']): Promise<Interview | null> {
    let _id: ObjectId;
    try {
      _id = new ObjectId(id);
    } catch {
      return null;
    }
    const result = await this.collection.findOneAndUpdate(
      { _id },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result ? this.toDomain(result) : null;
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
      doc.interviewerAccepted ?? false,
      doc.interviewerRejectReason,
      doc.candidateRejection,
      doc.candidateRejectionStatus,
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
      interviewerAccepted: entity.interviewerAccepted,
      interviewerRejectReason: entity.interviewerRejectReason,
      candidateRejection: entity.candidateRejection,
      candidateRejectionStatus: entity.candidateRejectionStatus,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

