import { Collection, ObjectId } from "mongodb";
import type { IInterviewerProfileRepository } from "../../../../application/interviewer/ports/repository/IInterviewerProfileRepository";
import { InterviewerProfile } from "../../../../domain/entities/InterviewerProfile";
import type { IInterviewerProfileDocument } from "../schemas/InterviewerProfileDocument";
import { BaseMongoRepository } from "./BaseMongoRepository";

export class MongoInterviewerProfileRepository
  extends BaseMongoRepository<InterviewerProfile, IInterviewerProfileDocument>
  implements IInterviewerProfileRepository
{
  constructor(collection: Collection<IInterviewerProfileDocument>) {
    super(collection);
  }

  async findByUserId(userId: string): Promise<InterviewerProfile | null> {
    const doc = await this.collection.findOne({ userId });
    return doc ? this.toDomain(doc as IInterviewerProfileDocument) : null;
  }

  async save(profile: InterviewerProfile): Promise<void> {
    const doc = this.toDocument(profile);

    if (!profile.id) {
      await this.collection.insertOne(doc);
      return;
    }

    const { _id, ...rest } = doc as IInterviewerProfileDocument;
    const update = Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v !== undefined)
    ) as Omit<IInterviewerProfileDocument, "_id">;

    const result = await this.collection.updateOne(
      { userId: profile.userId },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      throw new Error("Interviewer profile not found for update");
    }
  }

  protected toDomain(doc: IInterviewerProfileDocument): InterviewerProfile {
    return new InterviewerProfile(
      doc._id?.toString() ?? null,
      doc.userId,
      doc.fullName,
      doc.phone ?? "",
      doc.location ?? "",
      doc.title,
      doc.currentCompany ?? "",
      doc.yearsOfExperience,
      doc.bio,
      doc.technicalSkills ?? [],
      doc.languages ?? [],
      doc.education,
      doc.university ?? "",
      doc.educationList ?? [],
      doc.workExperience ?? [],
      doc.linkedinUrl ?? "",
      doc.githubUrl ?? "",
      doc.profilePicUrl ?? "",
      doc.createdAt,
      doc.updatedAt
    );
  }

  protected toDocument(entity: InterviewerProfile): IInterviewerProfileDocument {
    return {
      ...(entity.id && { _id: new ObjectId(entity.id) }),
      userId: entity.userId,
      fullName: entity.fullName,
      phone: entity.phone,
      location: entity.location,
      title: entity.title,
      currentCompany: entity.currentCompany,
      yearsOfExperience: entity.yearsOfExperience,
      bio: entity.bio,
      technicalSkills: entity.technicalSkills,
      languages: entity.languages,
      education: entity.education,
      university: entity.university,
      educationList: entity.educationList,
      workExperience: entity.workExperience,
      linkedinUrl: entity.linkedinUrl,
      githubUrl: entity.githubUrl,
      profilePicUrl: entity.profilePicUrl,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
