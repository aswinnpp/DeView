import { ObjectId } from 'mongodb';

export interface RefreshTokenDocument {
    _id?: ObjectId;
    userId: string;
    tokenHash: string;
    deviceInfo: string;
    expiresAt: Date;
    revoked: boolean;
    createdAt: Date;
    updatedAt: Date;
}
