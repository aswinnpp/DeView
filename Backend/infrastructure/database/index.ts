import { Db } from 'mongodb';
import { connectMongoDB } from '../persistence/mongodb/client/MongoClient.js';
import { createUserIndexes } from '../persistence/mongodb/indexes/user.indexes.js';
import { createOTPIndexes } from '../persistence/mongodb/indexes/otp.indexes.js';

let db: Db | null = null;

export async function initializeDatabase(): Promise<Db> {
    if (db) return db;

    db = await connectMongoDB();

    // Create all indexes in parallel for faster startup
    await Promise.all([
        createUserIndexes(db),
        createOTPIndexes(db),
    ]);

    return db;
}

export function getDatabase(): Db {
    if (!db) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return db;
}
