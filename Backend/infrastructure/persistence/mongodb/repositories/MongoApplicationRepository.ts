import type { Filter } from 'mongodb';
import { ObjectId } from 'mongodb';
import type { Collection } from 'mongodb';
import { Application } from '../../../../domain/application/entities/Application.js';
import type { IApplicationRepository } from '../../../../application/application/ports/repository/IApplicationRepository.js';
import type { IApplicationDocument } from '../schemas/ApplicationDocument.js';

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
    doc.createdAt,
    doc.updatedAt
  );
}

export class MongoApplicationRepository implements IApplicationRepository {
  constructor(private collection: Collection<IApplicationDocument>) {}

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
}
