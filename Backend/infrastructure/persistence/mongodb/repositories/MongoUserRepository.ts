import { Collection, ObjectId } from 'mongodb';
import type { UserRepositoryPort, UserSearchOptions } from '../../../../application/shared/ports/repository/UserRepositoryPort';
import { User } from '../../../../domain/user/entities/User';
import { Email } from '../../../../domain/user/value-objects/Email';
import { Role } from '../../../../domain/user/value-objects/Role';
import { UserDocument } from '../schemas/UserDocument';

export class MongoUserRepository implements UserRepositoryPort {
  constructor(private collection: Collection<UserDocument>) { }

  async findByEmail(email: Email): Promise<User | null> {
    const doc = await this.collection.findOne({ email: email.getValue() });
    return doc ? this.toDomain(doc) : null;
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    return doc ? this.toDomain(doc) : null;
  }

  async findByCompanyIdAndRole(
    companyId: string,
    role: string,
    options?: UserSearchOptions
  ): Promise<{ data: User[]; total: number }> {
    const { search, status, sortOrder = "desc", page = 1, limit } = options ?? {};
    const filter: Record<string, any> = { companyId, role };

    if (search && search.trim()) {
      const regex = { $regex: search.trim(), $options: "i" };
      filter.$or = [{ fullName: regex }, { email: regex }];
    }

    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;

    const total = await this.collection.countDocuments(filter);
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const cursor = this.collection
      .find(filter)
      .sort({ createdAt: sortDirection, _id: sortDirection });

    if (limit != null && limit > 0) {
      const skip = (Math.max(1, page) - 1) * limit;
      cursor.skip(skip).limit(limit);
    }

    const docs = await cursor.toArray();
    return { data: docs.map(doc => this.toDomain(doc)), total };
  }

  async findByRole(
    role: string,
    options?: UserSearchOptions
  ): Promise<{ data: User[]; total: number }> {
    const { search, status, sortOrder = "desc", page = 1, limit } = options ?? {};
    const filter: Record<string, any> = { role };

    if (search && search.trim()) {
      const regex = { $regex: search.trim(), $options: "i" };
      filter.$or = [{ fullName: regex }, { email: regex }];
    }

    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;

    const total = await this.collection.countDocuments(filter);
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const cursor = this.collection
      .find(filter)
      .sort({ createdAt: sortDirection, _id: sortDirection });

    if (limit != null && limit > 0) {
      const skip = (Math.max(1, page) - 1) * limit;
      cursor.skip(skip).limit(limit);
    }

    const docs = await cursor.toArray();
    return { data: docs.map(doc => this.toDomain(doc)), total };
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
      doc.passwordHash ?? undefined,
      new Role(doc.role),
      doc.companyId,
      doc.isActive,
      doc.isEmailVerified,
      doc.createdAt
    );
  }

  private toDocument(user: User): UserDocument {
    return {
      ...(user.id && { _id: new ObjectId(user.id) }),
      fullName: user.fullName,
      companyId: user.companyId,
      email: user.email.getValue(),
      ...(user.passwordHash != null && { passwordHash: user.passwordHash }),
      role: user.role.getValue(),
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

