import { Collection, ObjectId } from 'mongodb';
import type { IJobApplicationRepository, IApplicationInput } from '../../../../application/candidate/ports/repository/IJobApplicationRepository.js';
import type { IApplicationDocument } from '../schemas/ApplicationDocument.js';

export class MongoJobApplicationRepository implements IJobApplicationRepository {
  constructor(private _collection: Collection<IApplicationDocument>) {}

  async create(input: IApplicationInput): Promise<string> {
    const now = new Date();
    const doc: IApplicationDocument = {
      jobId: input.jobId,
      companyId: input.companyId,
      candidateUserId: input.candidateUserId,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      location: input.location,
      title: input.title,
      currentCompany: input.currentCompany,
      experience: input.experience,
      bio: input.bio,
      expectedSalary: input.expectedSalary,
      noticePeriod: input.noticePeriod,
      preferredWorkMode: input.preferredWorkMode,
      preferredJobType: input.preferredJobType,
      skills: input.skills,
      education: input.education,
      university: input.university,
      graduationYear: input.graduationYear,
      linkedinUrl: input.linkedinUrl,
      githubUrl: input.githubUrl,
      resumeUrl: input.resumeUrl,
      coverLetter: input.coverLetter,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    };

    const result = await this._collection.insertOne(doc as IApplicationDocument & { _id?: ObjectId });
    return result.insertedId.toString();
  }
}
