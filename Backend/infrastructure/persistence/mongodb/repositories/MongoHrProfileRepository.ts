import { Collection, ObjectId } from "mongodb";
import type { IHrProfileRepository } from "../../../../application/hr/ports/repository/IHrProfileRepository";
import { HrProfile } from "../../../../domain/entities/HrProfile";
import type { IHrProfileDocument } from "../schemas/HrProfileDocument";
import { BaseMongoRepository } from "./BaseMongoRepository";

export class MongoHrProfileRepository
  extends BaseMongoRepository<HrProfile, IHrProfileDocument>
  implements IHrProfileRepository
{
  constructor(collection: Collection<IHrProfileDocument>) {
    super(collection);
  }

  async findByUserId(userId: string): Promise<HrProfile | null> {
    const doc = await this.collection.findOne({ userId });
    return doc ? this.toDomain(doc as IHrProfileDocument) : null;
  }

  async save(profile: HrProfile): Promise<void> {
    const doc = this.toDocument(profile);

    if (!profile.id) {
      await this.collection.insertOne(doc);
      return;
    }

    const { _id, ...rest } = doc as IHrProfileDocument;
    const update = Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v !== undefined)
    ) as Omit<IHrProfileDocument, "_id">;

    const result = await this.collection.updateOne(
      { userId: profile.userId },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      throw new Error("HR profile not found for update");
    }
  }

  protected toDomain(doc: IHrProfileDocument): HrProfile {
    return new HrProfile(
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

  protected toDocument(entity: HrProfile): IHrProfileDocument {
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
