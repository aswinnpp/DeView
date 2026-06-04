import type { Collection, Filter } from 'mongodb';
import { ObjectId } from 'mongodb';
import { BaseMongoRepository } from './BaseMongoRepository.js';
import type { IInterviewFeedbackRepository } from '../../../../application/interview/ports/repository/IInterviewFeedbackRepository.js';
import type { IInterviewFeedbackDocument } from '../schemas/InterviewFeedbackDocument.js';
import { InterviewFeedback } from '../../../../domain/entities/InterviewFeedback.js';

export class MongoInterviewFeedbackRepository
  extends BaseMongoRepository<InterviewFeedback, IInterviewFeedbackDocument>
  implements IInterviewFeedbackRepository
{
  constructor(collection: Collection<IInterviewFeedbackDocument>) {
    super(collection);
  }

  async create(feedback: InterviewFeedback): Promise<InterviewFeedback> {
    const doc = this.toDocument(feedback);
    const res = await this.collection.insertOne(doc);
    return this.toDomain({ ...doc, _id: res.insertedId });
  }

  async findLatestByInterviewId(interviewId: string): Promise<InterviewFeedback | null> {
    const doc = await this.collection
      .find({ interviewId })
      .sort({ createdAt: -1 })
      .limit(1)
      .next();
    return doc ? this.toDomain(doc as IInterviewFeedbackDocument) : null;
  }

  async listByCandidateUserId(
    candidateUserId: string,
    options?: { search?: string; page?: number; limit?: number; sortOrder?: 'asc' | 'desc' }
  ): Promise<{ data: InterviewFeedback[]; total: number }> {
    const filter: Filter<IInterviewFeedbackDocument> = { candidateUserId };

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

  protected toDomain(doc: IInterviewFeedbackDocument): InterviewFeedback {
    return new InterviewFeedback(
      doc._id?.toString() ?? null,
      doc.interviewId,
      doc.candidateUserId,
      doc.companyId,
      doc.companyName,
      doc.jobId ?? '',
      doc.interviewerUserId,
      doc.interviewerName,
      doc.round ?? '',
      doc.feedback,
      doc.totalScore,
      doc.interviewType,
      doc.interviewLocation,
      doc.createdAt,
      doc.updatedAt
    );
  }

  protected toDocument(entity: InterviewFeedback): IInterviewFeedbackDocument {
    return {
      ...(entity.id && { _id: new ObjectId(entity.id) }),
      interviewId: entity.interviewId,
      candidateUserId: entity.candidateUserId,
      companyId: entity.companyId,
      companyName: entity.companyName,
      jobId: entity.jobId,
      interviewerUserId: entity.interviewerUserId,
      interviewerName: entity.interviewerName,
      round: entity.round,
      interviewType: entity.interviewType,
      interviewLocation: entity.interviewLocation,
      feedback: entity.feedback,
      totalScore: entity.totalScore,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

