import type { AnyBulkWriteOperation, Filter } from 'mongodb';
import { ObjectId } from 'mongodb';
import type { Collection } from 'mongodb';
import { Application } from '../../../../domain/application/entities/Application.js';
import type { ApplicationStatus } from '../../../../domain/application/entities/Application.js';
import type { IApplicationRepository } from '../../../../application/application/ports/repository/IApplicationRepository.js';
import type { IApplicationDocument } from '../schemas/ApplicationDocument.js';
import type { IJobDocument } from '../schemas/JobDocument.js';

function toDomain(doc: IApplicationDocument): Application {
  return new Application(
    doc._id?.toString() ?? null,
    doc.jobId,
    doc.companyId,
    doc.candidateUserId,
    doc.fullName,
    doc.email,
    doc.phone,
    doc.location,
    doc.title,
    doc.currentCompany,
    doc.experience,
    doc.bio,
    doc.expectedSalary,
    doc.noticePeriod,
    doc.preferredWorkMode,
    doc.preferredJobType,
    doc.skills ?? [],
    doc.education,
    doc.university,
    doc.graduationYear,
    doc.linkedinUrl,
    doc.githubUrl,
    doc.resumeUrl,
    doc.coverLetter,
    doc.status,
    doc.aiScore,
    doc.interviewDetails,
    doc.rejectionEmailContent,
    doc.rejectionSentAt,
    doc.createdAt,
    doc.updatedAt
  );
}

export class MongoApplicationRepository implements IApplicationRepository {
  constructor(
    private collection: Collection<IApplicationDocument>,
    private jobsCollection: Collection<IJobDocument>
  ) {}

  async listByJobId(
    jobId: string,
    companyId: string,
    status?: 'PENDING' | 'SHORTLISTED' | 'REJECTED'
  ): Promise<Application[]> {
    const filter: Filter<IApplicationDocument> = { jobId, companyId };
    if (status) filter.status = status;

    const docs = await this.collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map((doc) => toDomain(doc));
  }

  async listPendingByJobId(jobId: string, companyId: string): Promise<Application[]> {
    return this.listByJobId(jobId, companyId, 'PENDING');
  }

  async listByCandidateUserId(
    candidateUserId: string,
    options?: {
      status?: ApplicationStatus;
      search?: string;
      page?: number;
      limit?: number;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<{ data: Application[]; total: number }> {
    const {
      status,
      search,
      page = 1,
      limit = 20,
      sortOrder = 'desc',
    } = options || {};

    const filter: Filter<IApplicationDocument> = { candidateUserId };

    if (status) {
      filter.status = status;
    }

    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));
    const skip = (safePage - 1) * safeLimit;
    const sort = { createdAt: (sortOrder === 'asc' ? 1 : -1) as 1 | -1 };

    if (search && search.trim()) {
      const q = search.trim();
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pipeline: object[] = [
        { $match: filter },
        {
          $lookup: {
            from: this.jobsCollection.collectionName,
            let: {
              jid: { $convert: { input: '$jobId', to: 'objectId', onError: null, onNull: null } },
            },
            pipeline: [{ $match: { $expr: { $and: [{ $ne: ['$$jid', null] }, { $eq: ['$_id', '$$jid'] }] } } }],
            as: 'jobDoc',
          },
        },
        { $unwind: { path: '$jobDoc', preserveNullAndEmptyArrays: false } },
        { $match: { 'jobDoc.title': { $regex: escaped, $options: 'i' } } },
        { $project: { jobDoc: 0 } },
      ];

      const countPipeline = [...pipeline, { $count: 'total' }];
      const countResult = await this.collection.aggregate<{ total: number }>(countPipeline).toArray();
      const total = countResult[0]?.total ?? 0;

      const dataPipeline = [
        ...pipeline,
        { $sort: sort },
        { $skip: skip },
        { $limit: safeLimit },
      ];
      const docs = await this.collection.aggregate<IApplicationDocument>(dataPipeline).toArray();

      return {
        data: docs.map((doc) => toDomain(doc)),
        total,
      };
    }

    const total = await this.collection.countDocuments(filter);
    const docs = await this.collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(safeLimit)
      .toArray();

    return {
      data: docs.map((doc) => toDomain(doc)),
      total,
    };
  }

  async findByIdAndJobId(
    applicationId: string,
    jobId: string,
    companyId: string
  ): Promise<Application | null> {
    let _id: ObjectId;
    try {
      _id = new ObjectId(applicationId);
    } catch {
      return null;
    }
    const doc = await this.collection.findOne({
      _id,
      jobId,
      companyId,
    });
    return doc ? toDomain(doc) : null;
  }

  async updateAiScores(
    jobId: string,
    companyId: string,
    updates: Array<{ applicationId: string; aiScore: number }>
  ): Promise<void> {
    if (updates.length === 0) return;
    const bulkOps: AnyBulkWriteOperation<IApplicationDocument>[] = [];
    for (const { applicationId, aiScore } of updates) {
      try {
        const _id = new ObjectId(applicationId);
        bulkOps.push({
          updateOne: {
            filter: { _id, jobId, companyId },
            update: { $set: { aiScore, updatedAt: new Date() } },
          },
        });
      } catch {
        // skip invalid ObjectId
      }
    }
    if (bulkOps.length > 0) {
      await this.collection.bulkWrite(bulkOps);
    }
  }

  async updateStatus(input: {
    applicationId: string;
    jobId: string;
    companyId: string;
    status: ApplicationStatus;
    rejectionEmailContent?: string;
  }): Promise<Application | null> {
    const { applicationId, jobId, status, rejectionEmailContent } = input;

    let _id: ObjectId;
    try {
      _id = new ObjectId(applicationId);
    } catch {
      return null;
    }

    const setUpdate: Partial<IApplicationDocument> = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'REJECTED' && rejectionEmailContent && rejectionEmailContent.trim().length > 0) {
      setUpdate.rejectionEmailContent = rejectionEmailContent;
      setUpdate.rejectionSentAt = new Date();
    }

    // First perform the update
    const updateResult = await this.collection.updateOne(
      { _id, jobId },
      { $set: setUpdate }
    );

    // If nothing was matched, treat as not found
    if (!updateResult.matchedCount) {
      return null;
    }

  
    const doc = await this.collection.findOne({ _id, jobId });
    if (!doc) return null;
    return toDomain(doc);
  }

  async scheduleInterview(input: {
    applicationId: string;
    jobId: string;
    companyId: string;
    interviewDetails: NonNullable<IApplicationDocument['interviewDetails']>;
  }): Promise<Application | null> {
    const { applicationId, jobId, companyId, interviewDetails } = input;

    let _id: ObjectId;
    try {
      _id = new ObjectId(applicationId);
    } catch {
      return null;
    }

    const updateResult = await this.collection.updateOne(
      { _id, jobId, companyId },
      {
        $set: {
          status: 'INTERVIEW_SCHEDULED',
          interviewDetails,
          updatedAt: new Date(),
        },
      }
    );

    if (!updateResult.matchedCount) return null;
    const doc = await this.collection.findOne({ _id, jobId, companyId });
    return doc ? toDomain(doc) : null;
  }
}
