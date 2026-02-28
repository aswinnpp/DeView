import type { Collection, Filter } from 'mongodb';
import { ObjectId } from 'mongodb';
import { BaseMongoRepository } from './BaseMongoRepository.js';
import { Job } from '../../../../domain/job/entities/Job.js';
import type {
  IJobRepository,
  IListJobsOptions,
} from '../../../../application/job/ports/repository/IJobRepository.js';
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

  async listByCompanyIdPaginated(
    companyId: string,
    options?: IListJobsOptions
  ): Promise<{ data: Job[]; total: number }> {
    const filter: Filter<IJobDocument> = { companyId };

    if (options?.status) {
      filter.status = options.status;
    }

    if (options?.search?.trim()) {
      filter.title = { $regex: options.search.trim(), $options: 'i' };
    }

    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(100, Math.max(1, options?.limit ?? 10));
    const skip = (page - 1) * limit;

    const [total, docs] = await Promise.all([
      this.collection.countDocuments(filter),
      this.collection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
    ]);

    return {
      data: docs.map((doc) => this.toDomain(doc)),
      total,
    };
  }

  async listAllPaginated(
    options?: IListJobsOptions
  ): Promise<{ data: Job[]; total: number }> {
    const filter: Filter<IJobDocument> = {};

    if (options?.status) {
      filter.status = options.status;
    }

    if (options?.jobType?.trim()) {
      filter.jobType = { $regex: new RegExp(`^${options.jobType.trim()}$`, 'i') };
    }

    if (options?.search?.trim()) {
      const search = options.search.trim();
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
      ];
    }

    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(100, Math.max(1, options?.limit ?? 10));
    const skip = (page - 1) * limit;
    const sortOrder = options?.sortOrder ?? 'desc';
    const sortDir = sortOrder === 'asc' ? 1 : -1;

    const [total, docs] = await Promise.all([
      this.collection.countDocuments(filter),
      this.collection
        .find(filter)
        .sort({ createdAt: sortDir })
        .skip(skip)
        .limit(limit)
        .toArray(),
    ]);

    return {
      data: docs.map((doc) => this.toDomain(doc)),
      total,
    };
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

