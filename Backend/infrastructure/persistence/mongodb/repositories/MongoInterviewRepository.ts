import type { Collection, Filter } from 'mongodb';
import { ObjectId } from 'mongodb';
import { BaseMongoRepository } from './BaseMongoRepository.js';
import { Interview } from '../../../../domain/entities/Interview.js';
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

  async countByCandidateUserIdAndScheduledDate(
    candidateUserId: string,
    scheduledDate: string,
    options?: { excludeInterviewId?: string }
  ): Promise<number> {
    const filter: Filter<IInterviewDocument> = {
      candidateUserId,
      scheduledDate,
      status: { $ne: 'CANCELLED' },
    };

    if (options?.excludeInterviewId) {
      try {
        filter._id = { $ne: new ObjectId(options.excludeInterviewId) };
      } catch {
        // ignore invalid id
      }
    }

    return this.collection.countDocuments(filter);
  }

  async countByStatus(): Promise<number> {
    return this.collection.countDocuments();
  }

  async listByCandidateUserId(
    candidateUserId: string,
    options?: { search?: string; page?: number; limit?: number; sortOrder?: 'asc' | 'desc' }
  ): Promise<{ data: Interview[]; total: number }> {
    const filter: Filter<IInterviewDocument> = {
      candidateUserId,
      interviewerAccepted: true,
      status: { $in: ['SCHEDULED', 'RESCHEDULED'] },
    };

    if (options?.search && options.search.trim()) {
      const q = options.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.companyName = { $regex: q, $options: 'i' };
    }

    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.max(1, Math.min(100, options?.limit ?? 20));
    const skip = (page - 1) * limit;
    const sortDir = options?.sortOrder === 'asc' ? 1 : -1;

    const [docs, total] = await Promise.all([
      this.collection
        .find(filter)
        .sort({ createdAt: sortDir })
        .skip(skip)
        .limit(limit)
        .toArray(),
      this.collection.countDocuments(filter),
    ]);

    const data = docs.map((d) => this.toDomain(d));
    return { data, total };
  }

  async listByInterviewerUserId(
    interviewerUserId: string,
    options?: { search?: string; page?: number; limit?: number; sortOrder?: 'asc' | 'desc'; acceptedOnly?: boolean }
  ): Promise<{ data: Interview[]; total: number }> {
    const filter: Filter<IInterviewDocument> = {
      interviewerUserId,
      status: { $in: ['SCHEDULED', 'RESCHEDULED'] },
    };
    if (options?.acceptedOnly) {
      filter.interviewerAccepted = true;
    }
    if (options?.search && options.search.trim()) {
      const q = options.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { candidateName: { $regex: q, $options: 'i' } },
        { jobTitle: { $regex: q, $options: 'i' } },
      ];
    }
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.max(1, Math.min(100, options?.limit ?? 20));
    const skip = (page - 1) * limit;
    const sortDir = options?.sortOrder === 'asc' ? 1 : -1;
    const [docs, total] = await Promise.all([
      this.collection
        .find(filter)
        .sort({ createdAt: sortDir })
        .skip(skip)
        .limit(limit)
        .toArray(),
      this.collection.countDocuments(filter),
    ]);
    return { data: docs.map((d) => this.toDomain(d)), total };
  }

  async listCompletedByInterviewerUserId(
    interviewerUserId: string,
    options?: { search?: string; page?: number; limit?: number; sortOrder?: 'asc' | 'desc' }
  ): Promise<{ data: Interview[]; total: number }> {
    const filter: Filter<IInterviewDocument> = {
      interviewerUserId,
      status: 'COMPLETED',
    };
    if (options?.search && options.search.trim()) {
      const q = options.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { candidateName: { $regex: q, $options: 'i' } },
        { jobTitle: { $regex: q, $options: 'i' } },
      ];
    }
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.max(1, Math.min(100, options?.limit ?? 20));
    const skip = (page - 1) * limit;
    const sortDir = options?.sortOrder === 'asc' ? 1 : -1;
    const [docs, total] = await Promise.all([
      this.collection
        .find(filter)
        .sort({ updatedAt: sortDir })
        .skip(skip)
        .limit(limit)
        .toArray(),
      this.collection.countDocuments(filter),
    ]);
    return { data: docs.map((d) => this.toDomain(d)), total };
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

  async findLatestCompletedByApplicationId(applicationId: string): Promise<Interview | null> {
    const doc = await this.collection
      .find({ applicationId, status: 'COMPLETED' })
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
    input: {
      scheduledDate: string;
      scheduledTime: string;
      interviewerUserId: string;
      interviewerName: string;
      round: string;
      interviewType?: 'ONLINE' | 'CALL' | 'F2F';
      interviewLocation?: string;
    }
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
      interviewType: input.interviewType ?? 'ONLINE',
      interviewLocation: input.interviewType === 'F2F' ? input.interviewLocation?.trim() : undefined,
      status: 'SCHEDULED',
      updatedAt: new Date(),
    };
    const unsetFields: Record<string, ''> = {
      candidateRejection: '',
      candidateRejectionStatus: '',
      interviewerRejectReason: '',
    };
    if ((input.interviewType ?? 'ONLINE') !== 'F2F') {
      unsetFields.interviewLocation = '';
    }
    const result = await this.collection.findOneAndUpdate(
      { _id },
      { $set: update, $unset: unsetFields },
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

  async setFeedbackSubmitted(id: string, submitted: boolean): Promise<Interview | null> {
    let _id: ObjectId;
    try {
      _id = new ObjectId(id);
    } catch {
      return null;
    }
    const result = await this.collection.findOneAndUpdate(
      { _id },
      { $set: { feedbackSubmitted: submitted, updatedAt: new Date() } },
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
      doc.interviewType ?? 'ONLINE',
      doc.interviewLocation,
      doc.status,
      doc.feedbackSubmitted ?? false,
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
      interviewType: entity.interviewType,
      interviewLocation: entity.interviewLocation,
      status: entity.status,
      feedbackSubmitted: entity.feedbackSubmitted,
      interviewerAccepted: entity.interviewerAccepted,
      interviewerRejectReason: entity.interviewerRejectReason,
      candidateRejection: entity.candidateRejection,
      candidateRejectionStatus: entity.candidateRejectionStatus,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

