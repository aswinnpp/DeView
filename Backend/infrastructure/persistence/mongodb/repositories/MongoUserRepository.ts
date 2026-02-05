import { Collection, ObjectId } from 'mongodb';
import { UserRepository } from '../../../../domain/user/repositories/UserRepository';
import { User } from '../../../../domain/user/entities/User';
import { Email } from '../../../../domain/user/value-objects/Email';
import { Role } from '../../../../domain/user/value-objects/Role';
import { UserDocument } from '../schemas/UserDocument';

export class MongoUserRepository implements UserRepository {
    constructor(private readonly collection: Collection<UserDocument>) { }
    async findByEmail(email: Email): Promise<User | null> {
        const doc = await this.collection.findOne({ email: email.getValue() });
        return doc ? this.toDomain(doc) : null;
    }
    async findById(id: string): Promise<User | null> {
        const doc = await this.collection.findOne({ _id: new ObjectId(id) });
        return doc ? this.toDomain(doc) : null;
    }

    async findByRole(role: string): Promise<User[]> {
        const docs = await this.collection.find({ role }).toArray();
        return docs.map(doc => this.toDomain(doc));
    }

    async findByCompanyId(companyId: string): Promise<User[]> {
        const docs = await this.collection.find({ companyId }).toArray();
        return docs.map(doc => this.toDomain(doc));
    }

    async findByCompanyIdAndRole(companyId: string, role: string): Promise<User[]> {
        const docs = await this.collection.find({ companyId, role }).toArray();
        return docs.map(doc => this.toDomain(doc));
    }

    async create(user: User): Promise<string> {
        const doc = this.toDocument(user);
        const result = await this.collection.insertOne(doc);
        return result.insertedId.toString();
    }
    async update(user: User): Promise<void> {
        const doc = this.toDocument(user);
        const { _id, ...updateData } = doc;
        await this.collection.updateOne(
            { _id: new ObjectId(user.id) },
            { $set: updateData }
        );
    }

    async updatePassword(userId: string, newPasswordHash: string): Promise<User> {
        const result = await this.collection.findOneAndUpdate(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    passwordHash: newPasswordHash,
                    updatedAt: new Date()
                }
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            throw new Error('User not found');
        }

        return this.toDomain(result);
    }

    async delete(id: string): Promise<void> {
        await this.collection.deleteOne({ _id: new ObjectId(id) });
    }
    private toDomain(doc: UserDocument): User {
        return User.reconstitute({
            id: doc._id?.toString(),
            fullName: doc.fullName,
            companyName: doc.companyName,
            companyId: doc.companyId,
            email: new Email(doc.email),
            passwordHash: doc.passwordHash,
            role: new Role(doc.role),
            isActive: doc.isActive,
            isEmailVerified: doc.isEmailVerified,
            authProvider: doc.authProvider,
            googleId: doc.googleId,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }
    private toDocument(user: User): UserDocument {
        const persistence = user.toPersistence();
        return {
            ...(user.id && { _id: new ObjectId(user.id) }),
            fullName: persistence.fullName,
            companyName: persistence.companyName,
            companyId: persistence.companyId,
            email: persistence.email,
            passwordHash: persistence.passwordHash,
            role: persistence.role,
            isActive: persistence.isActive,
            isEmailVerified: persistence.isEmailVerified,
            authProvider: persistence.authProvider,
            googleId: persistence.googleId,
            createdAt: persistence.createdAt,
            updatedAt: persistence.updatedAt,
        };
    }
}
