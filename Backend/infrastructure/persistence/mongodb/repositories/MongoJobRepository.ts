import type { Collection } from 'mongodb';
import { ObjectId } from 'mongodb';
import { BaseMongoRepository } from './BaseMongoRepository.js';
import { Job } from '../../../../domain/job/entities/Job.js';
import type { IJobRepository } from '../../../../application/job/ports/repository/IJobRepository.js';
import type { IJobDocument } from '../schemas/JobDocument.js';

export class MongoJobRepository
  extends BaseMongoRepository<Job, IJobDocument>
  implements IJobRepository {
  constructor(collection: Collection<IJobDocument>) {
    super(collection);
  }

  async listByCompanyId(companyId: string): Promise<Job[]> {
    const cursor = this.collection.find({ companyId });
    const docs = await cursor.toArray();
    return docs.map((doc) => this.toDomain(doc));
  }

  protected toDomain(doc: IJobDocument): Job {
    return new Job(
      doc._id?.toString() ?? null,
      doc.companyId,
      doc.title,
      doc.department,
      doc.location,
      doc.jobType,
      doc.workMode,
      doc.experienceLevel,
      doc.minExperience,
      doc.maxExperience,
      doc.salary,
      doc.salaryNonDisclosure,
      doc.skills,
      doc.qualifications,
      doc.responsibilities,
      doc.benefits,
      doc.description,
      doc.applicationDeadline,
      doc.numberOfPositions,
      doc.interviewRounds,
      doc.status,
      doc.applicants,
      doc.createdAt,
      doc.updatedAt,
    );
  }

  protected toDocument(entity: Job): IJobDocument {
    return {
      ...(entity.id && { _id: new ObjectId(entity.id) }),
      companyId: entity.companyId,
      title: entity.title,
      department: entity.department,
      location: entity.location,
      jobType: entity.jobType,
      workMode: entity.workMode,
      experienceLevel: entity.experienceLevel,
      minExperience: entity.minExperience,
      maxExperience: entity.maxExperience,
      salary: entity.salary,
      salaryNonDisclosure: entity.salaryNonDisclosure,
      skills: entity.skills,
      qualifications: entity.qualifications,
      responsibilities: entity.responsibilities,
      benefits: entity.benefits,
      description: entity.description,
      applicationDeadline: entity.applicationDeadline,
      numberOfPositions: entity.numberOfPositions,
      interviewRounds: entity.interviewRounds,
      status: entity.status,
      applicants: entity.applicants,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

