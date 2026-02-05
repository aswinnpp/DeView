import { Collection, ObjectId } from 'mongodb';
import { RefreshToken } from '../../../../domain/auth/entities/RefreshToken.js';
import { RefreshTokenRepositoryPort } from '../../../../domain/auth/repositories/RefreshTokenRepositoryPort.js';
import { RefreshTokenDocument } from '../schemas/RefreshTokenDocument.js';

export class MongoRefreshTokenRepository implements RefreshTokenRepositoryPort {
    constructor(private readonly collection: Collection<RefreshTokenDocument>) {
        this.ensureIndexes();
    }

    private async ensureIndexes(): Promise<void> {
        await this.collection.createIndex({ tokenHash: 1 }, { unique: true });
        await this.collection.createIndex({ userId: 1 });
        await this.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    }

    async save(refreshToken: RefreshToken): Promise<RefreshToken> {
        const doc: RefreshTokenDocument = {
            userId: refreshToken.userId,
            tokenHash: refreshToken.tokenHash,
            deviceInfo: refreshToken.deviceInfo,
            expiresAt: refreshToken.expiresAt,
            revoked: refreshToken.revoked,
            createdAt: refreshToken.createdAt || new Date(),
            updatedAt: refreshToken.updatedAt || new Date(),
        };

        if (refreshToken.id) {
            await this.collection.updateOne(
                { _id: new ObjectId(refreshToken.id) },
                { $set: { ...doc, updatedAt: new Date() } }
            );
            return refreshToken;
        } else {
            const result = await this.collection.insertOne(doc);
            return RefreshToken.reconstitute({
                id: result.insertedId.toString(),
                userId: doc.userId,
                tokenHash: doc.tokenHash,
                deviceInfo: doc.deviceInfo,
                expiresAt: doc.expiresAt,
                revoked: doc.revoked,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            });
        }
    }

    async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
        const doc = await this.collection.findOne({ tokenHash });
        if (!doc) return null;

        return RefreshToken.reconstitute({
            id: doc._id!.toString(),
            userId: doc.userId,
            tokenHash: doc.tokenHash,
            deviceInfo: doc.deviceInfo,
            expiresAt: doc.expiresAt,
            revoked: doc.revoked,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    async findById(id: string): Promise<RefreshToken | null> {
        const doc = await this.collection.findOne({ _id: new ObjectId(id) });
        if (!doc) return null;

        return RefreshToken.reconstitute({
            id: doc._id!.toString(),
            userId: doc.userId,
            tokenHash: doc.tokenHash,
            deviceInfo: doc.deviceInfo,
            expiresAt: doc.expiresAt,
            revoked: doc.revoked,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    async findByUserId(userId: string): Promise<RefreshToken[]> {
        const docs = await this.collection.find({ userId }).toArray();
        return docs.map(doc =>
            RefreshToken.reconstitute({
                id: doc._id!.toString(),
                userId: doc.userId,
                tokenHash: doc.tokenHash,
                deviceInfo: doc.deviceInfo,
                expiresAt: doc.expiresAt,
                revoked: doc.revoked,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            })
        );
    }

    async revokeAllByUserId(userId: string): Promise<void> {
        await this.collection.updateMany(
            { userId },
            { $set: { revoked: true, updatedAt: new Date() } }
        );
    }

    async deleteExpired(): Promise<void> {
        await this.collection.deleteMany({
            expiresAt: { $lt: new Date() },
        });
    }

    async delete(id: string): Promise<void> {
        await this.collection.deleteOne({ _id: new ObjectId(id) });
    }
}
