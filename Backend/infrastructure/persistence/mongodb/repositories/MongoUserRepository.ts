import { Collection, ObjectId } from 'mongodb';
import { UserRepository } from '../../../../domain/user/repositories/UserRepository';
import { User } from '../../../../domain/user/entities/User';
import { Email } from '../../../../domain/user/value-objects/Email';
import { Role } from '../../../../domain/user/value-objects/Role';
import { UserDocument } from '../schemas/UserDocument';

export class MongoUserRepository implements UserRepository {
  constructor(private collection: Collection<UserDocument>) {}

  async findByEmail(email: Email): Promise<User | null> {
    const doc = await this.collection.findOne({ email: email.getValue() });
    return doc ? this.toDomain(doc) : null;
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    return doc ? this.toDomain(doc) : null;
  }

  async save(user: User): Promise<void> {
    const doc = this.toDocument(user);

    if (!user.id) {
      await this.collection.insertOne(doc);
      return;
    }

    const { _id, ...update } = doc;

    await this.collection.updateOne(
      { _id },
      { $set: update }
    );
  }

  private toDomain(doc: UserDocument): User {
    return new User(
      doc._id?.toString() || null,
      doc.fullName,
      new Email(doc.email),
      doc.passwordHash,
      new Role(doc.role),
      doc.companyId,
      doc.isActive,
      doc.isEmailVerified
    );
  }

  private toDocument(user: User): UserDocument {
    return {
      ...(user.id && { _id: new ObjectId(user.id) }),
      fullName: user.fullName,
      companyId: user.companyId,
      email: user.email.getValue(),
      passwordHash: user.passwordHash,
      role: user.role.getValue(),
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

