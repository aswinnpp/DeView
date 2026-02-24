import { Collection, ObjectId } from "mongodb";
import { ICandidateProfileRepository } from "../../../../application/candidate/ports/repository/ICandidateProfileRepository";
import { CandidateProfile } from "../../../../domain/candidate/entities/CandidateProfile";
import { ICandidateProfileDocument } from "../schemas/CandidateProfileDocument";
import { BaseMongoRepository } from "./BaseMongoRepository";

export class MongoCandidateProfileRepository
  extends BaseMongoRepository<CandidateProfile>
  implements ICandidateProfileRepository {
  constructor(collection: Collection<ICandidateProfileDocument>) {
    super(collection);
  }

  async findByUserId(userId: string): Promise<CandidateProfile | null> {
    const doc = await this.collection.findOne({ userId });
    return doc ? this.toDomain(doc as ICandidateProfileDocument) : null;
  }

  async save(profile: CandidateProfile): Promise<void> {
    const doc = this.toDocument(profile);

    if (!profile.id) {
      await this.collection.insertOne(doc);
      return;
    }

    const { _id, ...rest } = doc as ICandidateProfileDocument;
    const update = Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v !== undefined)
    ) as Omit<ICandidateProfileDocument, "_id">;

    const result = await this.collection.updateOne(
      { userId: profile.userId },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      throw new Error("Candidate profile not found for update");
    }
  }

  protected toDomain(doc: ICandidateProfileDocument): CandidateProfile {
    return new CandidateProfile(
      doc._id?.toString() || null,
      doc.userId,
      doc.fullName,
      doc.email,
      doc.phone,
      doc.location,
      doc.dateOfBirth,
      doc.title,
      doc.currentCompany,
      doc.currentSalary,
      doc.experience,
      doc.bio,
      doc.expectedSalary,
      doc.noticePeriod,
      doc.preferredWorkMode,
      doc.preferredJobType,
      doc.willingToRelocate ?? false,
      doc.skills ?? [],
      doc.languages ?? [],
      doc.education,
      doc.university,
      doc.graduationYear,
      doc.linkedinUrl,
      doc.githubUrl,
      doc.resumeUrl,
      doc.createdAt,
      doc.updatedAt
    );
  }

  protected toDocument(entity: CandidateProfile): ICandidateProfileDocument {
    return {
      ...(entity.id && { _id: new ObjectId(entity.id) }),
      userId: entity.userId,
      fullName: entity.fullName,
      email: entity.email,
      phone: entity.phone,
      location: entity.location,
      dateOfBirth: entity.dateOfBirth,
      title: entity.title,
      currentCompany: entity.currentCompany,
      currentSalary: entity.currentSalary,
      experience: entity.experience,
      bio: entity.bio,
      expectedSalary: entity.expectedSalary,
      noticePeriod: entity.noticePeriod,
      preferredWorkMode: entity.preferredWorkMode,
      preferredJobType: entity.preferredJobType,
      willingToRelocate: entity.willingToRelocate,
      skills: entity.skills,
      languages: entity.languages,
      education: entity.education,
      university: entity.university,
      graduationYear: entity.graduationYear,
      linkedinUrl: entity.linkedinUrl,
      githubUrl: entity.githubUrl,
      resumeUrl: entity.resumeUrl,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
