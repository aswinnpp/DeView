import type { Collection } from 'mongodb';
import { ObjectId } from 'mongodb';
import { BaseMongoRepository } from './BaseMongoRepository.js';
import type { IInterviewFeedbackRepository } from '../../../../application/interview/ports/repository/IInterviewFeedbackRepository.js';
import type { IInterviewFeedbackDocument } from '../schemas/InterviewFeedbackDocument.js';
import { InterviewFeedback } from '../../../../domain/interview/entities/InterviewFeedback.js';

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

  async listByCandidateUserId(candidateUserId: string): Promise<InterviewFeedback[]> {
    const docs = await this.collection
      .find({ candidateUserId })
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map((d) => this.toDomain(d));
  }

  protected toDomain(doc: IInterviewFeedbackDocument): InterviewFeedback {
    return new InterviewFeedback(
      doc._id?.toString() ?? null,
      doc.interviewId,
      doc.candidateUserId,
      doc.companyId,
      doc.companyName,
      doc.interviewerUserId,
      doc.interviewerName,
      doc.feedback,
      doc.totalScore,
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
      interviewerUserId: entity.interviewerUserId,
      interviewerName: entity.interviewerName,
      feedback: entity.feedback,
      totalScore: entity.totalScore,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

