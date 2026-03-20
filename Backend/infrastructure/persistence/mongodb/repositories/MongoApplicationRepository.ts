import type { AnyBulkWriteOperation, Filter } from 'mongodb';
import { ObjectId } from 'mongodb';
import type { Collection } from 'mongodb';
import { Application } from '../../../../domain/entities/Application.js';
import type { ApplicationStatus } from '../../../../domain/entities/Application.js';
import type { IApplicationRepository } from '../../../../application/job-application/ports/repository/IApplicationRepository.js';
import type { IApplicationDocument } from '../schemas/ApplicationDocument.js';
import type { IJobDocument } from '../schemas/JobDocument.js';

function toDomain(doc: IApplicationDocument): Application {
  const interviewRounds =
    doc.interviewRounds && doc.interviewRounds.length > 0
      ? doc.interviewRounds
      : doc.interviewDetails
        ? [{ ...doc.interviewDetails }]
        : [];

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
    interviewRounds,
    doc.rescheduleRequest,
    doc.completedRounds ?? [],
    doc.rejectionEmailContent,
    doc.rejectionSentAt,
    doc.createdAt,
    doc.updatedAt
  );
}

export class MongoApplicationRepository implements IApplicationRepository {
  constructor(
    private _collection: Collection<IApplicationDocument>,
    private _jobsCollection: Collection<IJobDocument>
  ) {}

  async listByJobId(
    jobId: string,
    companyId: string,
    status?: ApplicationStatus | ApplicationStatus[]
  ): Promise<Application[]> {
    const filter: Filter<IApplicationDocument> = { jobId, companyId };
    if (status) {
      filter.status = Array.isArray(status) ? { $in: status } : status;
    }

    const docs = await this._collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map((doc) => toDomain(doc));
  }

  async countByJobId(jobId: string, companyId: string): Promise<Record<ApplicationStatus, number>> {
    const rows = await this._collection
      .aggregate<{ _id: ApplicationStatus; count: number }>([
        { $match: { jobId, companyId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ])
      .toArray();

    const out = {} as Record<ApplicationStatus, number>;
    for (const r of rows) out[r._id] = r.count;
    return out;
  }

  async countByStatus(status: ApplicationStatus): Promise<number> {
    return this._collection.countDocuments({ status });
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
            from: this._jobsCollection.collectionName,
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
      const countResult = await this._collection.aggregate<{ total: number }>(countPipeline).toArray();
      const total = countResult[0]?.total ?? 0;

      const dataPipeline = [
        ...pipeline,
        { $sort: sort },
        { $skip: skip },
        { $limit: safeLimit },
      ];
      const docs = await this._collection.aggregate<IApplicationDocument>(dataPipeline).toArray();

      return {
        data: docs.map((doc) => toDomain(doc)),
        total,
      };
    }

    const total = await this._collection.countDocuments(filter);
    const docs = await this._collection
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
    const doc = await this._collection.findOne({
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
      await this._collection.bulkWrite(bulkOps);
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
    const updateResult = await this._collection.updateOne(
      { _id, jobId },
      { $set: setUpdate }
    );

    // If nothing was matched, treat as not found
    if (!updateResult.matchedCount) {
      return null;
    }

  
    const doc = await this._collection.findOne({ _id, jobId });
    if (!doc) return null;
    return toDomain(doc);
  }

  async addCompletedRound(input: {
    applicationId: string;
    jobId: string;
    companyId: string;
    round: string;
  }): Promise<Application | null> {
    const { applicationId, jobId, companyId, round } = input;
    let _id: ObjectId;
    try {
      _id = new ObjectId(applicationId);
    } catch {
      return null;
    }
    const result = await this._collection.findOneAndUpdate(
      { _id, jobId, companyId },
      {
        $addToSet: { completedRounds: round },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: 'after' }
    );
    return result ? toDomain(result) : null;
  }

  async scheduleInterview(input: {
    applicationId: string;
    jobId: string;
    companyId: string;
    roundDetails: {
      round: string;
      interviewer: string;
      interviewerEmail?: string;
      scheduledDate: string;
      scheduledTime: string;
    };
    isReschedule?: boolean;
  }): Promise<Application | null> {
    const { applicationId, jobId, companyId, roundDetails, isReschedule } = input;

    let _id: ObjectId;
    try {
      _id = new ObjectId(applicationId);
    } catch {
      return null;
    }

    const roundEntry = {
      round: roundDetails.round,
      interviewer: roundDetails.interviewer,
      ...(roundDetails.interviewerEmail && { interviewerEmail: roundDetails.interviewerEmail }),
      scheduledDate: roundDetails.scheduledDate,
      scheduledTime: roundDetails.scheduledTime,
    };

    let updateResult;
    if (isReschedule) {
      updateResult = await this._collection.updateOne(
        { _id, jobId, companyId, 'interviewRounds.round': roundDetails.round },
        {
          $set: {
            status: 'INTERVIEW_SCHEDULED',
            updatedAt: new Date(),
            'interviewRounds.$[elem].interviewer': roundEntry.interviewer,
            'interviewRounds.$[elem].scheduledDate': roundEntry.scheduledDate,
            'interviewRounds.$[elem].scheduledTime': roundEntry.scheduledTime,
            ...(roundEntry.interviewerEmail && {
              'interviewRounds.$[elem].interviewerEmail': roundEntry.interviewerEmail,
            }),
          },
          $unset: { rescheduleRequest: '' },
        },
        { arrayFilters: [{ 'elem.round': roundDetails.round }] }
      );
      if (!updateResult.matchedCount) {
        const doc = await this._collection.findOne({ _id, jobId, companyId });
        if (doc?.interviewDetails && !doc?.interviewRounds?.length) {
          updateResult = await this._collection.updateOne(
            { _id, jobId, companyId },
            {
              $set: {
                status: 'INTERVIEW_SCHEDULED',
                interviewDetails: { ...doc.interviewDetails, ...roundEntry },
                updatedAt: new Date(),
              },
              $unset: { rescheduleRequest: '' },
            }
          );
        }
      }
    } else {
      const doc = await this._collection.findOne({ _id, jobId, companyId });
      const hasLegacyOnly = doc?.interviewDetails && !doc?.interviewRounds?.length;
      if (hasLegacyOnly) {
        const legacy = doc!.interviewDetails!;
        const canPromoteLegacy =
          !!legacy.round && !!legacy.interviewer && !!legacy.scheduledDate && !!legacy.scheduledTime;
        await this._collection.updateOne(
          { _id, jobId, companyId },
          {
            $set: {
              ...(canPromoteLegacy ? { interviewRounds: [{ ...legacy }] } : {}),
              updatedAt: new Date(),
            },
          }
        );
      }
      updateResult = await this._collection.updateOne(
        { _id, jobId, companyId },
        {
          $set: { status: 'INTERVIEW_SCHEDULED', updatedAt: new Date() },
          $push: { interviewRounds: roundEntry },
          $unset: { rescheduleRequest: '' },
        }
      );
    }

    if (!updateResult.matchedCount) return null;
    const doc = await this._collection.findOne({ _id, jobId, companyId });
    return doc ? toDomain(doc) : null;
  }

  async setRescheduleRequest(input: {
    applicationId: string;
    jobId: string;
    companyId: string;
    rescheduleRequest: NonNullable<IApplicationDocument['rescheduleRequest']>;
  }): Promise<Application | null> {
    const { applicationId, jobId, companyId, rescheduleRequest } = input;

    let _id: ObjectId;
    try {
      _id = new ObjectId(applicationId);
    } catch {
      return null;
    }

    const updateResult = await this._collection.updateOne(
      { _id, jobId, companyId },
      {
        $set: {
          status: 'RESCHEDULE_REQUESTED',
          rescheduleRequest,
          updatedAt: new Date(),
        },
      }
    );

    if (!updateResult.matchedCount) return null;
    const doc = await this._collection.findOne({ _id, jobId, companyId });
    return doc ? toDomain(doc) : null;
  }

  async updateInterviewFeedback(input: {
    applicationId: string;
    jobId: string;
    companyId: string;
    round: string;
    feedback: string;
    totalScore: number;
  }): Promise<Application | null> {
    const { applicationId, jobId, companyId, round, feedback, totalScore } = input;

    let _id: ObjectId;
    try {
      _id = new ObjectId(applicationId);
    } catch {
      return null;
    }

    const updateResult = await this._collection.updateOne(
      { _id, jobId, companyId, 'interviewRounds.round': round },
      {
        $set: {
          'interviewRounds.$[elem].feedback': feedback,
          'interviewRounds.$[elem].totalScore': totalScore,
          updatedAt: new Date(),
        },
      },
      { arrayFilters: [{ 'elem.round': round }] }
    );

    if (!updateResult.matchedCount) {
      const docForLegacy = await this._collection.findOne({ _id, jobId, companyId });
      const hasLegacyDetails =
        !!docForLegacy?.interviewDetails && !docForLegacy.interviewRounds?.length;
      if (hasLegacyDetails) {
        await this._collection.updateOne(
          { _id, jobId, companyId },
          {
            $set: {
              'interviewDetails.feedback': feedback,
              'interviewDetails.totalScore': totalScore,
              updatedAt: new Date(),
            },
          }
        );
      } else {
        return null;
      }
    }
    const doc = await this._collection.findOne({ _id, jobId, companyId });
    return doc ? toDomain(doc) : null;
  }
}
